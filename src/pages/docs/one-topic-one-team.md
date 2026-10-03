---
layout: ../../layouts/Doc.astro
title: "One topic, one team"
description: "PolicyForge 1.7.0 documentation: One topic, one team."
source: "README.md at PolicyForge 1.7.0, lines 210-381"
licensedCommands: []
---

Compliance catalogs are organized for the person auditing the work: by
control family, in the order the framework's authors chose. Engineering
organizations are organized around the people doing the work: by system, by
service, by on-call rotation. Those two shapes almost never coincide, and
most compliance documentation fails because it keeps the auditor's shape and
hands it to engineers.

The synthesis step in this pipeline is a transpose. Instead of generating one
document per control — 300-plus artifacts, none of which anyone owns —
it generates one document per **topic**, and every topic has a single
accountable team.

The test is **ownership, not step count**. A topic can — and usually does —
involve several teams' work. User lifecycle touches HR for the joiner and
leaver signal, IAM for provisioning, IT support for hardware, and individual
app owners for entitlements. That's still *one* topic, because one team can
comfortably own the process end to end. What breaks a topic is not
cross-team steps; it's cross-team *accountability*, where two owners each
assume the other has it.

So a topic is well-formed when:

- **One team can comfortably own the whole process.** There's a clear owner
  who can describe it end to end, chase the handoffs, and answer for the
  outcome — not a process split down the middle between two teams who each
  own half.
- **Its handoffs live inside it, and the owner is accountable for them
  working.** This is deliberate. Most compliance failures aren't inside a
  team's remit, they're at the boundary — HR processes a termination and the
  deprovisioning signal never reaches IAM. Putting the seam inside a topic
  with a named owner is what makes someone responsible for the seam.
- **It has a coherent operational rhythm.** Continuous, on-change, quarterly.
  A topic that mixes a real-time detection duty with an annual attestation
  is two rhythms wearing one hat.
- **Its evidence collects together.** The same export, dashboard or ticket
  query should satisfy most of the requirements underneath it. This is where
  the multi-framework overlap finally pays off: one quarterly access-review
  artifact can answer HITRUST, HIPAA and 800-53 at once, but only if the
  requirements were gathered into one topic first.
- **It reads like a runbook, not a restatement.** If the output could be
  mistaken for a paraphrase of the control catalog, the topic hasn't earned
  its place.

**Around 25 topics is the practical ceiling.** Fewer than that and a topic
grows too broad for one team to own comfortably; many more and the topics
start slicing the same process apart, which reintroduces the split
accountability the model exists to avoid — and the cross-framework overlap
stops consolidating, because the shared requirements scatter across
neighbouring topics instead of gathering in one.

Twenty-odd procedures with named owners is a program someone can run. Three
hundred control write-ups is a document set that goes stale the week after
the audit.

The ownership axis is also what makes the multi-framework problem tractable
rather than multiplicative. HITRUST, HIPAA and 800-53 each have something to
say about access review; they say it three times, in three vocabularies, at
three levels of specificity. Gathered into one topic, that becomes a single
procedure the IAM team executes, with three sets of citations attached — and
the next framework added to the mix costs one more citation per requirement,
not a fourth parallel document set.

## The topic registry

Topics are declared in `config/topics.yaml` — gitignored, because it names
your internal teams. Copy `config/topics.example.yaml`, which ships a
20-topic starter set that fully covers the Low, Moderate and High baselines,
and change the owners to your teams.

```yaml
topics:
  - name: Identity Lifecycle & Access Review
    owner: IAM Engineering
    cadence: quarterly
    nist_controls: [AC-1, AC-2, AC-3, AC-5, AC-6, AC-14, IA-4, IA-12, PS-4, PS-5]
    evidence:
      - Identity provider user export
      - HR active-employee roster
      - Access review tickets with sign-off
```

`nist_controls` are **anchors, not an exhaustive list**: anchoring AC-2 also
claims AC-2(1) through AC-2(13), so a topic doesn't have to enumerate
enhancements. Anchor an enhancement directly only when it genuinely belongs
to another team — a direct claim beats an inherited one, which is how
AC-2(1) can sit with Platform Engineering while AC-2 stays with IAM without
either becoming contested.

## Checking ownership: `policyforge coverage`

```
policyforge coverage \
  --controls data/frameworks/nist-800-53-r5/controls.json \
  --controls data/frameworks/hipaa-security-rule/controls.json \
  --baseline moderate
```

```
Coverage — scope: Moderate baseline
============================================================
  In scope        287
  Owned           287 (100%)
  Orphaned        0
  Contested       0
...
HIPAA reachable via the crosswalk
------------------------------------------------------------
  65 of 75 requirements map to an owned NIST control
```

It reports four things, and needs no LLM — it's set arithmetic over the
registry:

- **Orphaned** — in-scope controls no topic claims. Nobody is doing the work,
  and nobody knows nobody is doing it.
- **Contested** — controls two or more topics claim. The worse of the two: on
  paper it looks covered, while each owner assumes the other has it.
- **Unknown anchors** — control IDs that don't exist in the catalog, i.e.
  typos. Distinguished from *anchored but out of scope*, which is normal —
  the PM and PT families sit in no baseline at all, so a topic legitimately
  anchors controls a Moderate analysis doesn't include.
- **Cross-framework reachability** — because topics anchor NIST controls and
  the crosswalk maps other frameworks onto them, an owned NIST control also
  accounts for the HIPAA requirements mapped to it. Same orphan question,
  asked from the assessor's side.

`--baseline` matters: "orphaned" only means something relative to a defined
scope. `--strict` exits non-zero when anything is orphaned, contested or
mis-anchored, which makes it usable as a CI gate; `--json` emits the report
for further processing.

## From registry to document

`synthesize --topic-name` takes a topic straight from the registry, so its
anchor controls and its owning team come from one declared place instead of
being retyped on the command line:

```
policyforge synthesize --topic-name "Media Handling & Disposal" \
  --controls data/frameworks/nist-800-53-r5/controls.json \
  --controls data/frameworks/hipaa-security-rule/controls.json
```

The owner then has to survive the gap between two commands — `synthesize`
knows it, `generate` needs it — so it travels *in* the synthesis file, as
YAML frontmatter:

```yaml
---
topic: Media Handling & Disposal
owner: IT Asset Management
cadence: continuous
evidence:
  - Certificates of destruction
  - Media transport log
nist_controls: [MP-1, MP-2, MP-3, MP-4, MP-5, MP-6]
---
```

`generate` reads that back and names the real team wherever the document has
to say who performs a step, who reviews, or who answers for the outcome —
instead of falling back to `[Responsible Team]`. The cadence and evidence
artifacts flow through the same way, so a generated Standard cites the
actual review frequency and the actual artifacts the topic is expected to
produce.

The frontmatter is optional and additive. `synthesize --topic <name> --nist-controls <ids>` still works for a one-off topic that isn't in the
registry; it writes no frontmatter, and says so, and the resulting document
uses placeholders exactly as before. Synthesis files written before any of
this existed still generate unchanged.
