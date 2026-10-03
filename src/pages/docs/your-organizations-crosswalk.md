---
layout: ../../layouts/Doc.astro
title: "Your organization's crosswalk"
description: "PolicyForge 1.7.0 documentation: Your organization's crosswalk."
source: "README.md at PolicyForge 1.7.0, lines 753-820"
licensedCommands: []
---

Everything that crosses frameworks — `map`, `synthesize`, `coverage`,
`bundle`, Zardoz — reads the published crosswalk by default, and the
published crosswalk is the weakest input in the project: pairs with no stated
relationship and no reasoning (see [The problem this solves](/docs/the-problem-this-solves/)).
A crosswalk overlay is where an organization records what it has decided
about those pairs instead. It lives in `config/crosswalks/`, next to the topic
registry, and like the registry it is gitignored by `policyforge init`:

```bash
policyforge crosswalk seed       # config/crosswalks/hipaa-security-rule.yaml
policyforge crosswalk propose    # a model reads each requirement; nothing is decided
policyforge crosswalk review     # a person accepts or rejects, one pair at a time
policyforge crosswalk check      # what no longer matches the catalogs
```

**`seed`** writes the published mapping with every pair accepted. Nothing
changes — `map` produces byte-identical output with and without it — but the
file is now yours to edit. **Only accepted pairs reach the pipeline.** A
requirement the overlay lists has its mapping replaced by its accepted rows;
one it does not list keeps the published mapping, so reviewing ten
requirements never unmaps the other sixty-five.

**`propose`** asks the configured model to read each requirement against a
short list of 800-53 candidates — word matches, the family's policy control,
and the published pairs, mixed in without being labelled as published. For
each control it says addresses the requirement, it must quote the words of
both texts that justify it, and a quote the text does not contain discards
the mapping before anyone sees it. What it finds is written as notes, never as
decisions:

| The model…                                   | The overlay row                                               |
| -------------------------------------------- | ------------------------------------------------------------- |
| quotes a basis for a published pair          | stays accepted, gains the quotes and a suggested relationship |
| was shown a published pair and gave no basis | stays accepted, flagged `not-confirmed-by-model`              |
| maps a control nobody published              | added as `proposed` — not in the pipeline until reviewed      |

**Why a model does not decide.** Measured on the 75 HIPAA requirements
before this was built, two models confirmed 31% and 41% of NIST's published
pairs while being shown every one, and agreed with each other on 58% of what
they asserted. In the disagreements read by hand, most were not an error on
either side: NIST's pairs often link a requirement to controls that *support*
it — incident reporting for reviewing system activity — where the models mapped
the controls that *carry the obligation*. Which of those an organization means by "mapped"
is its own decision, and the value of `propose` is putting the difference, with
the words behind each side, in front of the person making it. See
MEASUREMENTS.md for the probe and the eval suite graded on the cases nobody
would dispute.

**`review`** shows the flagged published pairs first, then new proposals:
the requirement with the standard it sits under, the control, and the quotes.
Each accept or reject is written as it is made, with who and when and an
optional reason, and a later `propose` never touches a reviewed row or
re-proposes a rejected one. Accepting a pair is also where its relationship is
decided: the model's suggestion is offered as the default, and nothing the
model suggests reaches a report until a person has accepted it.

**Licensed catalogs leave no text behind.** When a catalog `propose` reads is
licensed — a HITRUST export under `local_content/`, which only a local model
may read — each quote is verified as usual and then recorded as a digest, not
words, so the overlay holds no licensed requirement text. An organization that
commits its overlay to review it by pull request can, for that reason, still
do so. An overlay is never written inside `data/frameworks/`.

**Relationships reach `coverage`.** Where the overlay records that every owned
control covers only part of a requirement (`superset` or `intersects`), the
report lists it as reached only in part rather than counting it as reached.
