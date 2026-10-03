---
layout: ../../layouts/Doc.astro
title: "Handling a framework update"
description: "PolicyForge 1.7.0 documentation: Handling a framework update."
source: "README.md at PolicyForge 1.7.0, lines 2218-2286"
licensedCommands: []
---

NIST republishes the 800-53 catalog without telling you. The failure is
silent: your documents keep citing AC-2 while AC-2 quietly says something
else, and nobody finds out until somebody reads both.

Slurping up an update is two commands, because `etl-oscal` overwrites the
catalog in place and **git is still holding the version you had** — no
snapshot to remember, no `--old` to pass:

```
policyforge etl-oscal
policyforge drift --controls data/frameworks/nist-800-53-r5/controls.json
```

```
Rev 5 (5.1.1) -> Rev 5 (5.2.0): 1 added, 1 removed, 3 changed.
4 change(s) alter what the organization must do; 1 are editorial.

Worth reading:
  ADDED   AC-99  (added)
          reaches nothing you have written yet
  REMOVED AC-4  (removed)
  CHANGED AC-2  (control_statement, parameters)
          topics: Access Review | docs: standards/access-review.md | parameters: AC-2/frequency
  CHANGED AU-6  (baseline)
          topics: Audit Logging

Editorial only (1): CP-9

Blast radius:
  2 topic(s): Access Review, Audit Logging
  1 document(s): standards/access-review.md
  1 recorded parameter decision(s): AC-2/frequency
```

The question a bump raises isn't *what is different* — a diff answers that
and is unreadable — but **what do I have to go and look at?** So this walks
all the way through to documents rather than stopping at control
identifiers, and separates changes by what they touch:

| Change                              | Treated as  | Why                                              |
| ----------------------------------- | ----------- | ------------------------------------------------ |
| Control statement                   | substantive | It is the requirement                            |
| Baseline moved                      | substantive | Changes what the SSP answers for                 |
| Enhancement added or dropped        | substantive | A new obligation, or one retired                 |
| An ODP appeared or vanished         | substantive | A decision you now owe, or no longer get to make |
| Discussion, title, related controls | editorial   | Noted, kept out of the way                       |

That last row is what keeps the report readable. Reporting a reworded
discussion paragraph as work is how a drift report becomes something people
skim past — so a CP-9 discussion edit does **not** drag the backup Standard
into review.

The parameter line is the one worth pausing on: if AC-2's frequency stopped
being organization-defined, a value you recorded and defended was decided
against wording that no longer exists. That is exactly the thing nobody
notices.

**Both wrong answers are expensive.** Regenerate everything and you discard
every hand edit and every review the documents ever had. Change nothing and
they quietly stop matching the catalog they cite. A blast radius you can
trust is what makes the third option available.

`.github/workflows/framework-drift.yml` runs this monthly with
`--fail-on-change`, so a red build is the notification and the job log is the
triage list. It writes nothing — applying an update is a pull request
somebody opens after reading the report, because deciding what a changed
requirement *means* is the part that needs a person.
