---
layout: ../../layouts/Doc.astro
title: "System Security Plan (SSP)"
description: "PolicyForge 1.7.0 documentation: System Security Plan (SSP)."
source: "README.md at PolicyForge 1.7.0, lines 2355-2431"
licensedCommands: []
---

`policyforge ssp` builds a NIST 800-53 System Security Plan as a spreadsheet
workbook — a different output path from the Policy/Standard/Procedure
documents, aimed at the control-by-control table an assessor reads.

```
policyforge ssp \
  --controls data/frameworks/nist-800-53-r5/controls.json \
  --controls data/frameworks/hipaa-security-rule/controls.json \
  --baseline moderate \
  --system-name "Acme Health Platform"
```

**Format: `.xlsx`, and no Excel licence is needed.** Despite the name, xlsx
is not a Microsoft-proprietary format — it's the open ISO/IEC 29500
(ECMA-376) standard, written here by `openpyxl` in pure Python. LibreOffice
Calc opens and edits it natively. It's used in preference to `.ods` only
because the same file also opens unmodified in Excel and Google Sheets, and
in preference to `.csv` because a csv can't carry dropdowns, frozen headers
or multiple sheets.

Five sheets:

| Sheet                  | What's in it                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| System Information     | The plan elements NIST SP 800-18 expects — system identification, FIPS 199 categorization, owner, authorizing official, operational status, environment, interconnections |
| Control Implementation | One row per control: NIST's verbatim control text, its enhancements, plus implementation status, control origination, responsible role and implementation narrative       |
| Control Enhancements   | One row per enhancement, since baselines select and assessors evaluate them separately                                                                                    |
| CIS Summary            | The checkbox matrix from FedRAMP's SSP Appendix J "CIS Worksheet", derived by formula from the Control Implementation sheet so the two can't drift apart                  |
| Reference              | The controlled vocabularies backing the dropdowns, their definitions, and the provenance of the control data                                                              |

The Implementation Status and Control Origination vocabularies are
FedRAMP's, read from its published
[SSP Appendix J CIS/CRM Workbook](https://www.fedramp.gov/assets/resources/templates/SSP-Appendix-J-CSO-CIS-and-CRM-Workbook.xlsx),
and enforced by dropdown. `--baseline low|moderate|high` narrows the plan to
one NIST baseline, selecting controls and enhancements independently the way
NIST's own profiles do (AC-2 is in Low; AC-2(1) is not).

Because this is built inside PolicyForge, each control also carries a
`Maps to: HIPAA` column drawn from the crosswalk — so a single workbook shows
which HIPAA requirements each 800-53 control satisfies.

## What the LLM does, and what it deliberately doesn't

Only the **implementation description** is generated. The control
description is copied verbatim from the NIST catalog and is never
paraphrased — it's authoritative wording, and a drifting paraphrase is an
audit finding waiting to happen.

The narrative itself is a *scaffold*, not an assertion. Nothing in this tool
can know what a system actually does, so the prompt requires a
`[Square-Bracket Placeholder]` wherever a detail is unknown rather than a
plausible guess, forbids naming vendors outside your configured vendor list,
and follows the control's own a./b./c. lettering so it can be checked
part-by-part. Every generated cell is prefixed `[DRAFT — REVIEW REQUIRED]`
and the row is flagged "Not reviewed". An SSP that confidently describes
controls a system doesn't have is worse than an empty one: it's a false
attestation.

`--no-narratives` builds the workbook with those cells empty and makes no
LLM calls; otherwise the command tells you how many requests it's about to
make and asks before making them.

`--batch` submits those requests together through the Batch API instead of
one at a time, for half the price. This is the path it suits: several
hundred requests and nobody watching, so waiting on a queue costs nothing
but the wait. The organization block in front of every control is marked as
a cacheable prefix either way. That marker only does anything on a provider
that implements caching — the Anthropic and Vertex providers, not LiteLLM —
and no saving has been measured yet: epoch 21 recorded zero cached input
tokens, because both runs went through LiteLLM. Results come back in
whatever order the API finishes them and are matched to controls by ID —
never by position, which would fill every cell with another control's
narrative and look entirely plausible. Anthropic provider only; with any
other configured provider `--batch` says so rather than quietly costing
twice what you asked for.
