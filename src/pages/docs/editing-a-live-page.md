---
layout: ../../layouts/Doc.astro
title: "Editing a live page"
description: "PolicyForge 1.7.0 documentation: Editing a live page."
source: "README.md at PolicyForge 1.7.0, lines 921-1066"
licensedCommands: []
---

`policyforge edit-confluence` takes a plain-language instruction, fetches the
page, **plans** the edits, shows you the plan and the resulting diff, and
publishes only when you ask it to.

```
policyforge edit-confluence \
  --instruction "Tighten the access review cadence to monthly, and add a
                 section on how review outcomes are recorded." \
  --space ENG --title "Access Control Standard" \
  --host https://yourorg.atlassian.net/wiki
```

Plan and execution are deliberately two separate LLM calls. The plan is the
review surface: six steps read in a few seconds catch "you're about to delete
the exceptions section" far more reliably than diffing a regenerated page,
rejecting a bad plan costs one call instead of a careful read of the whole
document, and the plan itself records what was asked, what was intended, and
what was declined — which is the provenance a change to a live policy page
needs.

The planner is allowed to refuse, and does. Asked to shorten a review cadence,
add a section, *and* delete a requirement, it planned the first two and put
the third under **Needs your judgement**:

> Deleting the least privilege requirement [NIST AC-6] would remove a stated
> access control requirement tied to a NIST citation; this narrows the
> standard's scope and should be confirmed by a human before removal.

It also listed what it wouldn't guess at under **Not attempted** — where the
new section should live, and what system records the outcomes — and filled
the gaps it did write with `[Access Review Record Repository]` placeholders
rather than inventing a tool.

## Editing a topic's whole document set

A real change rarely lands in one document. "Access reviews move from
quarterly to monthly" belongs in the Standard (which states the requirement)
and the Procedure (which carries the steps), and usually shouldn't touch the
Policy at all. `policyforge edit-topic` applies one instruction across the
set, resolving the pages from the topic registry:

```yaml
# config/topics.yaml
- name: Identity Lifecycle & Access Review
  owner: IAM Engineering
  nist_controls: [AC-1, AC-2, AC-3, ...]
  confluence:
    space: SEC
    pages:
      policy: Access Control Policy
      standard: Access Control Standard
      procedure: Access Review Procedure
```

```
policyforge edit-topic   --instruction "Access reviews move from quarterly to monthly."   --topic-name "Identity Lifecycle & Access Review"   --host https://yourorg.atlassian.net/wiki
```

This is not three single-page runs in a loop. Two things make it different:

- **Each page is planned at its own altitude.** The planner is told which
  tier it's reading and that the siblings exist and are being edited in the
  same run, so it doesn't paste a threshold change into the Policy or restate
  the Standard's requirement in the Procedure. A page whose plan comes back
  empty is left completely untouched — no rewrite call, no diff, no publish —
  rather than having an edit forced into it to justify the run.
- **Nothing publishes until everything is ready.** Every page is fetched,
  macro-checked, planned and rewritten before any of them is written back,
  and you confirm the set once. Confluence has no cross-page transaction, so
  this narrows the window rather than closing it: a failure *during* the
  publish loop is reported page by page, naming exactly what landed and what
  didn't, so a half-updated set is visible instead of silent.

`--tiers standard,procedure` narrows the run when you already know where the
change belongs. Everything in **The gates** below applies to `edit-topic`
identically.

## The gates

This is the only part of PolicyForge that changes something outside the repo,
so the defaults are conservative:

- **Dry run by default.** Without `--apply` it plans, rewrites, writes the
  result to `output/edits/` and shows the diff — and touches nothing in
  Confluence. `--apply` publishes; without `--yes` it still asks first.

- **Version-guarded writes.** The page version read at fetch time is checked
  at publish time, so an edit made while you were planning fails loudly
  instead of being silently overwritten. This is why editing uses
  `update_page_body` rather than `export_to_confluence`, which re-reads the
  version at write time. `publish` used to win unconditionally for the same
  reason, which was wrong for publishing too: an edit somebody made on the
  wiki last week was destroyed the next time an unrelated document merged.
  It now overwrites only a page whose latest version this tool wrote — every
  write is stamped in its version message — or whose version `pull` has
  already brought into the repository; anything else is reported as moved,
  not published, and fails the run.

- **Macro refusal.** The edit path is storage format → markdown → edit →
  storage format, which is lossless only for the `code` macro this project's
  own exporter emits. A page containing a panel, expand block or page-property
  macro is **refused**, not warned about, because editing it would flatten
  parts nobody asked to change. `--allow-macros` overrides once you've read
  what will be lost.

- **Citation and section checks.** After the rewrite, every inline source tag
  (`[NIST AC-2 | HIPAA 164.308(a)(3)(i)]`) present before is checked for
  afterwards, as is every heading the plan didn't ask to remove. Losses are
  reported before the publish prompt. A rewrite that reads fine but has
  quietly dropped an assessor's traceability is the most damaging failure
  this tool could have.

- **Local history either way.** The page's "before" state is recorded to
  `output/.history/confluence/<slug>/` as soon as it's fetched — before any
  LLM call — so there's something to diff and restore from even if the run is
  abandoned. Confluence keeps its own page versions too; this is the local
  copy.

- **The plan is kept, not just printed.** Terminal output scrolls away, and
  Confluence's own page history records *what* changed but not why. So the
  plan — the instruction, each step, what was flagged under **Needs your
  judgement**, and what the model declined under **Not attempted** — is
  written to `output/edits/<slug>.plan.json` (dry runs included) and stored in
  the published version's history metadata alongside the model name and the
  page version the edit created. Read it back with:

  ```
  policyforge history --tier confluence --name access-control-standard
  ```

  which prints each revision with the plan that produced it:

  ```
  v1  2026-08-30T00:58:04+00:00  confluence-edit-before  +3/-0  cc2c08068aef
  v2  2026-08-30T01:14:22+00:00  confluence-edit-after   +1/-1  a9b5c9d61bc8
          asked: Access reviews move from quarterly to monthly.
          - [modify] Requirements: change the review cadence to monthly
          ! flagged: A monthly cadence increases reviewer workload.
          ~ not done: Left the Policy alone; cadence is a Standard-tier detail.
  ```

  The refusals matter as much as the edits: "the model was asked to delete
  the least-privilege requirement and declined" is exactly the kind of thing
  an assessor asks about a year later, and it exists nowhere else.
