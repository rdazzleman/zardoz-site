---
layout: ../../layouts/Doc.astro
title: "Status"
description: "PolicyForge 1.7.0 documentation: Status."
source: "README.md at PolicyForge 1.7.0, lines 440-751"
licensedCommands: ["etl-govramp", "etl-hitrust", "etl-soc2-tsc"]
---

The full pipeline is functional end-to-end: `etl-oscal` -> `map` ->
`synthesize` -> `generate` -> `export-confluence` (optional), plus `ssp` as a
separate output path. All six LLM providers (Anthropic, Bedrock, Vertex,
openai-compat/local, LiteLLM and cascade),
the control loaders, crosswalk builder, LLM-driven synthesis/generation
stages, Confluence export/import, and local version history are all wired up
and tested. The loaders for licensed frameworks (HITRUST CSF, GovRAMP and
SOC 2) are not part of the public PolicyForge: they're in the
licensed-framework plugin, which is distributed separately. With the plugin,
`etl-hitrust` reads your own MyCSF export (CSV, workbook, HTML or MHTML),
`etl-govramp` reads your own GovRAMP controls matrix workbook, and
`etl-soc2-tsc` reads your own copy of the Trust Services Criteria. Nothing
licensed is bundled or committed: `etl-hitrust` and `etl-govramp` parse in
memory and write nothing without `--out`, and `etl-soc2-tsc` writes only to
the `--out` path you give it. Without the plugin, each command says so; for
HITRUST and GovRAMP, `generate-parser` can draft a loader for your own export
instead.

Bundled and populated from public-domain sources, each re-fetchable:

| Data                                                                                                  | Command               | Source                          |
| ----------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------- |
| NIST 800-53 Rev 5 (300 controls, 714 enhancements, Low/Moderate/High baselines)                       | `etl-oscal`           | NIST's OSCAL content repository |
| HIPAA Security Rule (34 standards, 41 implementation specifications)                                  | `etl-hipaa`           | eCFR's public API               |
| HIPAA-to-800-53 crosswalk (278 mappings over 108 NIST controls)                                       | `etl-hipaa-crosswalk` | NIST's CPRT catalog             |
| ARC-AMPE Volume II (402-item ACA Administering Entity mandatory baseline)                             | `etl-arc-ampe`        | CMS's published SSPP workbook   |
| FedRAMP control tailoring (79 controls: 19 parameter values, 64 guidance blocks)                      | `etl-fedramp`         | `FedRAMP/rules` rules dataset   |
| Information blocking (21 sections, 55 exception conditions) — *not a control catalog*, see its README | `etl-info-blocking`   | eCFR's public API               |

Because the crosswalk is wired into `mapping/crosswalk.py`, `synthesize`
pulls HIPAA requirements into a NIST-anchored topic alongside NIST/FedRAMP,
and `ssp` shows each 800-53 control's HIPAA equivalents as a column.
ARC-AMPE and FedRAMP both number their controls with 800-53 identifiers, so
they anchor onto the same table — `map` spans 427 NIST controls with all
four loaded.

One caveat on the FedRAMP row, because it is the kind of thing that
misstates a scope if skimmed: it is **tailoring, not a baseline**. Nothing
in it says which controls a Low, Moderate or High system must implement.
FedRAMP published that selection as OSCAL profiles in
`GSA/fedramp-automation`, that repository no longer exists, and no official
machine-readable replacement has appeared — so `baseline` is left empty on
every FedRAMP control rather than guessed, and `ssp --baseline` has nothing
to filter on there. Use the 800-53 baselines for that. ARC-AMPE's rows are
a real mandatory baseline and are marked as one.

## The shape of HITRUST CSF

Because the content can't be shipped, the *structure* has to be documented
instead — that is what lets you point this at your own licensed copy and
have it work. The long form lives with the licensed-framework plugin, which
is distributed separately; this is the short one.

**Four tiers, and the middle one is easy to miss:**

```
Control Category             "NN.0 - <category title>"
  Control Objective          "NN.NN <objective title>"
    Control Reference        "NN.a <control reference title>"
      Requirement            one per (control reference x level)
```

Each tier is several times the size of the one above it, and every release
adds to them. A **Control Reference**
is what maps to this project's `Control`: an id, a title, and a
one-paragraph Control Specification that reads like a policy statement. It
is not what an assessor grades you against.

**Levels are alternatives, not enhancements.** Under each reference sit
requirement statements, one per level, and "level" spans two different
things written into one column:

- **Maturity levels** — `Level 1`, `Level 2`, `Level 3`. An ordered ladder.
  Every reference has a Level 1; some carry the higher levels too.
- **Overlays** — labels such as `Level HIPAA`, `Level FedRAMP`, `Level CMS`, `Level FTI Custodians`, `Level GDPR`, and many more. Unordered, named for the
  authority that compels them, and switched on by a **scoping factor**
  (organizational: bed count, covered lives; system: internet-accessible;
  regulatory: do you handle federal tax information) rather than by ambition.

That distinction is why the schema grew a `Requirement` type rather than
reusing `ControlEnhancement`. An 800-53 enhancement *adds* rigour to a
control everyone shares. A HITRUST overlay is a parallel statement selected
by a scoping factor — two organizations assessed against the same control
reference can be graded on entirely different sentences, and modelling that
as extra credit on top of Level 1 would double-count every control that
carries one.

**The crosswalk is the valuable part.** Each requirement statement carries a
Control Standard Mapping: a list of `<authoritative source> <identifier>`
strings, many thousands of them across dozens of sources in a full library. HITRUST
has already done the reconciliation this project otherwise does by hand, and
four of those sources — NIST SP 800-53, the HIPAA Security Rule, CMS
ARC-AMPE, FedRAMP — are catalogs PolicyForge already bundles.

The strings have no delimiter between the source and the identifier, and
both halves contain spaces, digits and punctuation:

```
NIST SP 800-53 r5 PL-11
Example State Dept Title 10 Section 123.45 (d)(3)(x)
Example Accreditor (v2016) EA IM.01.02.03, EP 1
```

(The first line is a public NIST control id. The other two are invented to
show the shapes real sources take.)

No regex splits those. The source vocabulary is **learned from your export**
by branching frequency — a source name is a token prefix after which many
different things follow — which means it works on next year's sources
without anybody updating a list, and means no piece of HITRUST's own content
has to live in this repository for the split to work.

## Why HITRUST is bring-your-own-content

The table above is the public-domain half of the overlap. The HITRUST half
isn't there, and won't be: **HITRUST CSF is licensed content.** Its
requirement text and its mappings can't be redistributed, so no open-source
project can ship them — not this one, not any other. That is a licensing
fact, not an oversight, and it's the reason a healthcare organization can't
just download a solved HITRUST-to-NIST reconciliation from anywhere.

This project's answer is to split the problem along the licence line:

- **The engine is open.** Crosswalk logic, topic synthesis, the
  Policy/Standard/Procedure generators, the SSP builder — all here, all
  public.
- **The public-domain content is bundled.** NIST 800-53, HIPAA, and NIST's
  own HIPAA-to-800-53 crosswalk, each re-fetchable from source.
- **You bring your own HITRUST.** Your MyCSF export, under your own licence,
  parsed from `local_content/` (gitignored). It is never written into
  `data/frameworks/`, never committed, never uploaded by this tool.
- **The LLM closes the gap between them.** This is the part that makes the
  arrangement work rather than merely legal. Even with both halves in hand,
  the published mappings are the bare ID pairs described above. Reconciling
  your licensed HITRUST requirements against the public NIST controls —
  collapsing the duplicates, keeping the real conflicts, carrying the
  stricter prescribed value — is the language work the LLM does locally,
  against content you already hold a licence to.

### Reading your export

```bash
policyforge etl-hitrust --export local_content/hitrust/CSFLibraryReport.csv
```

That parses the export and prints what it found — control references,
requirement statements, levels, and which authoritative sources its mappings
reach. **Nothing is written** unless you pass `--out`, and `--out` refuses
any path under `data/frameworks/` outright, and any path the model boundary
would not treat as licensed, whatever the flags: write under
`local_content/`. It also refuses any path git would not ignore
unless your config declares `frameworks.allow_licensed_in_repo`.

The HITRUST loader is part of the licensed-framework plugin, which is
distributed separately. Without it, `etl-hitrust` says so and points you to
`generate-parser`. Two properties of a MyCSF export are worth
knowing before you pick a file to hand it:

- **Prefer the CSV.** The rendered HTML/MHTML of the same report is more
  clearly labelled, but carries markedly fewer authoritative-source
  mappings. The mappings are most of why ingesting
  HITRUST is worth doing.
- **A CSV export is a rendered report, not a dataset.** Its column headers
  are SQL Server Reporting Services textbox names (`Textbox52`,
  `Textbox105`) that identify nothing, and it repeats whole rows. Columns
  are recognised by their caption
  columns and value shapes, and the duplicates are collapsed on the way in.

If detection fails on your export's shape,
`policyforge generate-parser --framework hitrust --sample <path>` drafts a
loader for that specific file. Read
[Generating a BYOC parser](/docs/licensing-model-per-framework/#generating-a-byoc-parser-from-a-sample-export)
first: that command sends your export's contents to your LLM provider, and
whether your licence permits that is a question to answer before running it,
not after.

## The shape of a GovRAMP controls matrix

GovRAMP (formerly StateRAMP) publishes no control catalog of its own. It is
a **profile over NIST SP 800-53 Rev 5**: it selects which 800-53 controls a
cloud service offering must meet, reproduces their text verbatim, and adds
two things the base catalog deliberately leaves open.

- **Parameter values.** Where 800-53 writes `[Assignment: organization-defined frequency]`, GovRAMP writes
  `AC-1 (c) (1) [at least every 3 years]`. For anyone pursuing a GovRAMP
  authorization these are not suggestions — they are the answer, already
  decided, with a citation.
  [`policyforge parameters`](/docs/organization-defined-parameters/)
  exists because 800-53 leaves roughly 1,200 such values to you; a profile
  answers a few hundred outright.
- **Additional requirements and guidance.** Normative sentences layered on
  top of a control — "the service provider defines the time period for
  non-user accounts" — that appear nowhere in 800-53.

And one axis 800-53 does not have: the **verification tier**.

### Tiers are not impact levels

A GovRAMP matrix is published *per impact level* — a Low, a Moderate and a
High workbook, matching the FIPS 199 categorisation of the system. Within
one workbook, three columns then say which controls are required to reach
each of GovRAMP's three verification tiers:

| Tier           | Controls required                            |
| -------------- | -------------------------------------------- |
| **Core**       | the smallest set                             |
| **Ready**      | Core's, and more                             |
| **Authorized** | Ready's, and more: the whole impact baseline |

Each tier's set contains the one before it, and the file is the only place
that nesting is stated — so `etl-govramp` checks it rather than assuming it.
A break means the three columns were misidentified, which is the kind of
failure where every count still looks plausible and every scope built on
them is wrong.

The two axes multiply, and conflating them is the mistake worth naming:
"Moderate Ready" and "Moderate Authorized" are different obligations over
the same catalog. Read the tier as a baseline and you conclude a service
offering must implement the whole Authorized set when only the Ready set
stands between it and the tier it is actually pursuing, which is several
times smaller. `Control.baseline` therefore carries both, impact
level first — `Moderate; Core, Ready, Authorized` — so that
`--baseline moderate` and a filter for `core` both land correctly.

## Why GovRAMP is bring-your-own-content

The same licence split as HITRUST, for a different reason. GovRAMP's Terms &
Conditions claim ownership of the "documents, downloadable files" published
on their site, and no redistribution grant was found. That is a weaker
position than HITRUST's explicit licensing — it may well be that GovRAMP
would grant permission if asked, and
[emailing info@govramp.org](/docs/licensing-model-per-framework/)
is on the roadmap — but "nobody said we couldn't" is not a licence, and
assuming content is redistributable because nobody said otherwise is the
failure mode with consequences.

So: you bring your own matrix, it lives in `local_content/` (gitignored), it
is parsed locally, and nothing is written unless you ask.

### Reading your matrix

```bash
policyforge etl-govramp --export local_content/govramp/GovRAMP-Controls-Matrix_Mod_Rev5_V1.06.xlsx
```

That parses the workbook and prints what it found, in this shape (the
counts are your matrix's):

```
GovRAMP Rev 5 (<version>) Moderate
  <N> controls, <M> enhancements, <F> families
  Required per tier (controls and enhancements):
    Core        <a>
    Ready       <b>
    Authorized  <c>
  <P> GovRAMP-defined parameter values across <Q> controls/enhancements
  <R> additional requirement/guidance blocks
```

**Nothing is written** unless you pass `--out`, and `--out` refuses any path
under `data/frameworks/` outright, and any path the model boundary would not
treat as licensed, whatever the flags: write under `local_content/`.
It also refuses any path git would not ignore unless your config declares
`frameworks.allow_licensed_in_repo`. Same gate as `etl-hitrust`.

Pass the workbook as GovRAMP publishes it, not an extract of it. What
arrives is a working SSP template — fourteen sheets, of which one holds the
controls and the rest are a cover page, instructions, dashboards, an
inventory workbook and blank grids for a service provider to fill in. Three
things about that layout are worth knowing:

- **The sheet is found by its header captions, not its name.** It is
  `12_Mod Controls` in the Moderate workbook, and the number is a position
  in a template GovRAMP renumbers between revisions. Scoring every sheet on
  its captions means the Low and High workbooks need no special case.
- **The header spans two rows.** Row 1 spans group titles across merged
  cells; row 2 holds the captions that name columns. They are merged into
  one caption per column before anything is matched.
- **Identifiers are normalized to the catalog's spelling.** The matrix
  writes `AC-2 (1)` in one column and `AC-02 (01)` in another; both become
  `AC-2(1)`, which is what the OSCAL loader produces. That is not cosmetic:
  a profile's identifiers *are* the identifiers of the catalog it profiles,
  so they are the crosswalk's join key, and `AC-2 (1)` joins to nothing.

The GovRAMP loader is part of the licensed-framework plugin, which is
distributed separately. Without it, `etl-govramp` says so and points you to
`generate-parser`. If detection fails on your workbook's shape,
`policyforge generate-parser --framework govramp --sample <path>` drafts a
loader for that specific file — read
[Generating a BYOC parser](/docs/licensing-model-per-framework/#generating-a-byoc-parser-from-a-sample-export)
first, for the same reason as HITRUST: that command sends your file's
contents to your LLM provider.

### Crossing it with the rest

Because GovRAMP shares 800-53's identifiers, it crosses automatically:

```bash
policyforge etl-govramp --export local_content/govramp/GovRAMP-Controls-Matrix_Mod_Rev5_V1.06.xlsx \
  --out local_content/govramp/controls.json
policyforge map --controls data/frameworks/nist-800-53-r5/controls.json \
  --controls local_content/govramp/controls.json \
  --controls data/frameworks/hipaa-security-rule/controls.json
```

From there `coverage`, `synthesize`, `parameters` and `ssp` treat it like
any other catalog. The profile's two additions ride along into synthesis:
where GovRAMP has already decided a value, the model is given it rather than
left to fill in `[Assignment: ...]` by guessing, and the added requirements
are handed over as normative text rather than dropped.
