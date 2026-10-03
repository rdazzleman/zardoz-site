---
layout: ../../layouts/Doc.astro
title: "The problem this solves"
description: "PolicyForge 1.7.0 documentation: The problem this solves."
source: "README.md at PolicyForge 1.7.0, lines 152-208"
licensedCommands: []
---

A healthcare organization rarely gets to pick one framework. It carries the
HIPAA Security Rule because it's law, HITRUST CSF because a payer or partner
contract demands certification, and often a NIST-based program on top —
800-53 directly, or through FedRAMP, ARC-AMPE, or a customer's security
addendum. These catalogs cover largely the same ground in different words,
at different granularity, with different prescribed values.

The obvious fix is a crosswalk, and both NIST and HITRUST publish one. In
practice the published mappings are necessary but nowhere near sufficient,
for reasons that are structural rather than fixable by a better spreadsheet:

- **They are bare ID pairs, often with no stated relationship.** This repo
  ingests NIST's own HIPAA-to-800-53 crosswalk from CPRT. Its OLIR format
  has fields for a relationship type (*equal to*, *subset of*, *intersects
  with*) and a rationale — and in the published data those fields are
  **empty**, for that crosswalk and for the other OLIR crosswalks alongside
  it. What you get is "these two identifiers are related somehow."
- **The fan-out is unusable at the row level.** That same crosswalk is 278
  pairs across 68 HIPAA citations and 108 NIST controls. One citation —
  § 164.316(b)(2)(iii), on updating documentation — maps to 21 separate NIST
  controls. An engineer handed that row has a matrix, not a task.
- **Granularity doesn't line up.** NIST AC-2 is twelve lettered parts,
  a. through l., several with sub-items of their own. A mapping to a HITRUST
  requirement points at *AC-2*, not at which of those parts it actually
  corresponds to.
- **The prescribed values are missing on one side and specified on the
  other.** SP 800-53 Rev 5 carries 1,600 organization-defined parameters —
  1,467 assignments (`[Assignment: organization-defined frequency]` and
  friends) plus 133 selections. HITRUST frequently states a concrete value
  instead, and varies it by implementation level. A crosswalk row reconciles
  none of this: someone still has to decide the number, once, and defend it
  to both assessors.
- **The scoping axes are different.** HITRUST implementation levels are
  driven by organizational risk factors (record volumes, regulatory
  exposure). NIST baselines are driven by FIPS 199 impact categorization.
  Level 2 is not Moderate.
- **Control text is declarative; procedures are imperative.** "Review
  accounts for compliance with account management requirements
  [Assignment: frequency]" and "every quarter, the IAM team exports the
  Okta user list, reconciles it against Workday active employees, and opens
  a ticket per exception" are different genres of writing. Nothing in a
  crosswalk performs that translation.
- **No framework tells you who does the work.** AC-2 alone touches identity
  engineering, HR onboarding/offboarding, and individual application owners.
  The catalog is silent on ownership, which is precisely the thing an
  operational document needs to establish.

Reconciling all of that is a language problem before it is a data problem —
which is why the merge step here is LLM-driven rather than a lookup table.
It is doing work a join cannot do: collapsing requirements that say the same
thing in different vocabulary, keeping genuinely conflicting ones apart,
carrying the stricter prescribed value forward with its source attached, and
rewriting declarative control language as ordered steps — while every
statement stays tagged back to the controls it came from, so the traceability
an assessor needs survives the rewrite.
