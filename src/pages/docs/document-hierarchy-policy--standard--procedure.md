---
layout: ../../layouts/Doc.astro
title: "Document hierarchy: Policy > Standard > Procedure"
description: "PolicyForge 1.8.0 documentation: Document hierarchy: Policy > Standard > Procedure."
source: "README.md at PolicyForge 1.7.0, lines 1668-1702, revised for 1.8.0 from its changelog and command line"
licensedCommands: []
---

Every topic's synthesis output (see `synthesis/merge.py`) can be drafted
into more than one document tier, each with a different audience and level
of detail — `policyforge generate --tier <tier>`:

- **Standard** (`--tier standard`, the default) — the detailed, technical
  document: every synthesized requirement, source-tagged back to the
  frameworks it came from in one short form (`[HIPAA Security Rule
  164.308(a)(4)(ii)(C) | NIST AC-2]`; 800-53's ids appear once, under
  `NIST`, and a tailoring such as FedRAMP is named as a baseline),
  vendor-specific where `org.vendors` allows it. Under each section, a
  collapsible block per framework quotes every requirement that section
  cites, **in the catalog's own words**, taken from the catalog itself and
  never from the model. A licensed catalog is listed by id and title only,
  unless you set `standards.quote_licensed: true`. `check` holds every quote
  to its catalog, character for character. Audience: security/IT staff who
  implement and audit against it.
- **Policy** (`--tier policy`) — a short, principle-level document read by
  the whole organization, not just practitioners. It states intent and scope
  in plain language and carries no framework or control citations: that
  traceability lives in the Standards. One Policy can cover several
  Standards:
  - with `--policy "<name>"`, it is drafted over **every Standard whose topic
    names that Policy** in `config/topics.yaml`, with one section per
    Standard and a closing "Standards under this Policy" list (each
    Standard's title, owner and file) written by code, not by the model.
    The registry `init` writes groups its topics, 16 to 25 depending on your
    scope facts, under 9 to 11 Policies.
  - with `--standard <path>`, it is drafted from one topic's Standard, which
    it references by name in its "Related Standards" section.
- **Procedure** (`--tier procedure`, requires `--standard <path>`) — one
  level *more* granular than the Standard: each requirement becomes the
  literal ordered steps a practitioner performs to satisfy it, referencing
  the Standard by name. The steps carry no citations; a final
  **Traceability** section lists each step with the Standard section it
  implements and the citations it carried.

A topic names its Policy with `policy:` in `config/topics.yaml`, and the
`policies:` block there describes each Policy (its name, accountable
executive, cadence, description and the page it publishes to). A generated
Standard records its Policy in its frontmatter and says in one sentence
which Policy it implements.

Generate each topic's Standard first, then its Procedure from that Standard,
and the Policy over the Standards it covers:

```
policyforge generate --tier standard --synthesis output/synthesis/auth-mgmt.md
policyforge generate --tier procedure --synthesis output/synthesis/auth-mgmt.md \
  --standard docs/standards/auth-mgmt.md
policyforge generate --tier policy --policy "Access Control"
```

Documents are written into the content tree that `check`, `publish` and
Zardoz read: `docs/standards/`, `docs/procedures/` and `docs/policies/`
(the Policy above goes to `docs/policies/access-control.md`). `--out`
writes somewhere else.

One Policy comes from no single topic: `policyforge generate --document
acceptable-use` drafts an **Acceptable Use Policy**, the rules every member
of the workforce signs before access, and a privileged-user addendum, from a
fixed set of 800-53 controls (PL-4, PS-6, AC-8 and others) whichever topics
anchor them. Both go to `docs/policies/`, each with an acknowledgment block to
sign and a traceability appendix.
