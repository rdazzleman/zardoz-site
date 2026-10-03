---
layout: ../../layouts/Doc.astro
title: "Company context"
description: "PolicyForge 1.7.0 documentation: Company context."
source: "README.md at PolicyForge 1.7.0, lines 383-438"
licensedCommands: []
---

Frameworks describe what must be true. They can't describe *your* org — and
that difference is most of the distance between a document template and a
procedure someone can follow on a Tuesday. That org-specific half lives in
one gitignored file, `config/config.yaml` (copy `config/config.example.yaml`
to start), and it feeds every generation stage.

```yaml
org:
  name: "Northwind Health"
  industry: "Healthcare provider"
  vendors: [Okta, AWS, CrowdStrike, Workday]

system:              # NIST SP 800-18 plan elements, used by `policyforge ssp`
  name: "Patient Portal"
  overall_categorization: "Moderate"
  owner: "Platform Engineering"
```

It matters more than its size suggests, for three reasons.

**It decides whether output is specific or generic.** Every generator here
is under strict instructions never to invent a vendor, a frequency, an owner
or a tool. What it doesn't know, it writes as a `[Square-Bracket Placeholder]` — deliberately, because a plausible-sounding invention in a
compliance document is worse than an obvious blank. The context file is how
you convert those blanks into specifics. With `vendors: [Okta]`, an access
control procedure names Okta; without it, you get `[Identity Provider]` and
a job for a human. Placeholders are the correct default, not a failure —
but the more context you supply, the fewer of them you're left editing.

**It's a boundary, not just a convenience.** `config.yaml` is gitignored
because it holds your org's name, vendor stack, system inventory and the env
var naming your API key. That keeps the engine publishable while the
org-specific content stays local — the same split that lets licensed HITRUST
content be processed here without ever being committed.

**It makes regeneration cheap.** Swapping an EDR vendor or re-categorizing a
system is a config edit and a re-run, not a pass through every document
looking for the old product name. The same property makes the documents
reproducible: same context plus same control data yields the same output.

## A known rough edge

`vendors` is a flat list, so the model has to *infer* what each product is
for. In a real run against AC-7 with `vendors: [Okta, AWS]`, the draft came
back as:

> …enforces unsuccessful logon attempt limits through **\[Identity Provider
> — Okta\]**, the identity provider for the system.

It hedged a vendor it had actually been given, wrapping a known name in
placeholder brackets, because nothing told it Okta was the IdP rather than,
say, the HR system. Role-keyed context — `identity_provider: Okta`,
`edr: CrowdStrike`, `hr_system: Workday` — would make that substitution
deterministic instead of inferred. See the roadmap.
