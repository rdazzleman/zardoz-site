---
layout: ../../layouts/Doc.astro
title: "Organization-defined parameters"
description: "PolicyForge 1.7.0 documentation: Organization-defined parameters."
source: "README.md at PolicyForge 1.7.0, lines 2288-2353"
licensedCommands: []
---

SP 800-53 doesn't tell you how often to review accounts. It says
`[Assignment: organization-defined frequency]` and leaves the number to you —
**1,210 times** across the bundled catalog, counting statements and
enhancements.

Those decisions get made whether or not anyone decides them. Without a
ledger, a model picks each one inside the prose it's drafting, with no memory
of what it chose for the neighbouring control. The result is documents that
are individually plausible and collectively indefensible: the Access Control
Standard says quarterly, the Audit Standard says "periodically", the SSP says
annually, and an assessor asking *why quarterly?* gets no answer, because
there isn't one.

```
policyforge parameters --controls data/frameworks/nist-800-53-r5/controls.json   --baseline moderate --group
```

```
742 organization-defined parameter(s) in scope: 0 decided, 742 undecided

By the kind of value being decided:
  selection             0/93 decided
  frequency             0/71 decided
  personnel or roles    0/54 decided
  time period           0/29 decided
```

**Scoping is what makes this tractable.** The whole catalog is a thousand
distinct parameters, which is not a to-do list. `--baseline moderate` is 742;
`--topics config/topics.yaml` narrows it to what your own topics anchor. And
they aren't a thousand different questions — "frequency" is asked 71 times —
so `--group` sorts by leverage and lets you decide one kind of value at a
sitting.

`--init` scaffolds `config/parameters.yaml` with every in-scope parameter,
preserving anything already decided:

```yaml
parameters:
  # AC-2: frequency
  #   a. Review accounts [Assignment: organization-defined frequency];
  AC-2/frequency:
    value: 'quarterly'
    rationale: 'HITRUST 01.c specifies quarterly; 800-53 leaves it ODP, so the stricter framework governs.'
    source: 'HITRUST CSF 01.c'
```

`synthesize` substitutes decided values into the control text **before** the
merge, which is the ordering that matters: a requirement that already says
"quarterly" is one the model restates, while one that still says
`[Assignment: organization-defined frequency]` is one it quietly decides,
differently in every document.

Three things the design insists on:

- **An undecided parameter stays undecided.** No value means the marker
  survives into the output, which reads as the gap it is. That is better than
  a number nobody chose.
- **A value without reasoning is reported.** "Why quarterly" is the question
  asked a year later; the ledger flags decisions carrying no `rationale` or
  `source`.
- **A decision is never silently lost.** If a control is reworded and a key
  no longer matches, it's reported as stale and *kept in the file* — a change
  upstream should cost you a question, not a decision you made and defended.
