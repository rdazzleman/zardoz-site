---
layout: ../../layouts/Doc.astro
title: "Quickstart"
description: "PolicyForge 1.8.0 documentation: Quickstart."
source: "README.md at PolicyForge 1.7.0, lines 22-73"
licensedCommands: []
---

Install it, lay out a project, and draft one Standard. On PolicyForge
1.7.0, these steps ran start to finish on a clean directory in two model
calls, $0.0070 and about 90 seconds on `openrouter/z-ai/glm-5.3-flash`;
they were not re-timed for 1.8.

```bash
brew install rdazzleman/tap/policyforge
# or, without Homebrew:
# pipx install git+https://github.com/rdazzleman/policyforge@v1.8.0

policyforge init my-policies --provider anthropic && cd my-policies
                                                   # writes config/config.yaml (provider, model, and the NAME of
                                                   # the env var holding your key) and config/topics.yaml
                                                   # (topics chosen from your scope facts, each with an owning team:
                                                   # add --personal-data phi, --baseline 800-53 and the like);
                                                   # leave --provider off for a local model that needs no key
export ANTHROPIC_API_KEY=sk-...                    # whichever variable your config names
policyforge llm-check                              # confirms the key works, and prints what the provider supports

# Cross-reference the catalogs `init` wrote. No model calls.
policyforge map --controls data/frameworks/nist-800-53-r5/controls.json \
                --controls data/frameworks/hipaa-security-rule/controls.json \
                --controls data/frameworks/fedramp/controls.json \
                --controls data/frameworks/arc-ampe/controls.json

# Merge every control this topic owns into one set of requirements.
policyforge synthesize --topic-name "Identity Lifecycle & Access Review" \
                       --controls data/frameworks/nist-800-53-r5/controls.json \
                       --controls data/frameworks/hipaa-security-rule/controls.json

# Draft the Standard from that synthesis.
policyforge generate --tier standard \
                     --synthesis output/synthesis/identity-lifecycle-access-review.md
```

You get a Standard in `docs/standards/` (the content tree `check`, `publish`
and Zardoz read), its synthesis in `output/synthesis/`, the version history
in `output/.history/`, and an account of every model call in
`policyforge model-log`.

Expect the draft to name `[Identity Provider]`, `[Ticketing System]` and
their kin: a role nobody has filled stays a visible placeholder rather than a
guess. Fill them in under `org:` in `config/config.yaml` (`policyforge roles`
lists the keys) and generate again. What to do next — the other two tiers,
publishing to Confluence, asking questions of the result — is in the sections
below.

**What a full set costs.** Twenty topics at four documents each, measured on
2026-09-17 with PolicyForge 1.2.1 and not re-measured since
([Measurements](/trust/measurements/), epoch 21): **$0.28 and 103 minutes on
`glm-5.3-flash`**; on `claude-sonnet-5`, five topics cost $3.09, so a full
set extrapolates to **about $12** — an order of magnitude, not a quote, since
those five are the first in the registry rather than a random sample. No eval
graded those documents: the figures say what a run costs, not whether it is
any good.
