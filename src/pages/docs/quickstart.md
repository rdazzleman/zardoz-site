---
layout: ../../layouts/Doc.astro
title: "Quickstart"
description: "PolicyForge 1.7.0 documentation: Quickstart."
source: "README.md at PolicyForge 1.7.0, lines 22-73"
licensedCommands: []
---

Install it, lay out a project, and draft one Standard. The commands below
were run start to finish on a clean directory: two model calls, $0.0070 and
about 90 seconds on `openrouter/z-ai/glm-5.3-flash`.

```bash
brew install rdazzleman/tap/policyforge
# or, without Homebrew:
# pipx install git+https://github.com/rdazzleman/policyforge@v1.7.0

policyforge init my-policies && cd my-policies

cp config/config.example.yaml config/config.yaml   # provider, model, and the NAME of the env var holding your key
cp config/topics.example.yaml config/topics.yaml   # 20 starter topics, each with an owning team
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

You get a Standard in `output/standards/`, its synthesis in
`output/synthesis/`, the version history in `output/.history/`, and an
account of every model call in `policyforge model-log`.

Expect the draft to name `[Identity Provider]`, `[Ticketing System]` and
their kin: a role nobody has filled stays a visible placeholder rather than a
guess. Fill them in under `org:` in `config/config.yaml` (`policyforge roles`
lists the keys) and generate again. What to do next — the other two tiers,
publishing to Confluence, asking questions of the result — is in the sections
below.

**What a full set costs.** Twenty topics at four documents each, measured in
MEASUREMENTS.md (epoch 21): **$0.28 and 103 minutes on
`glm-5.3-flash`**; on `claude-sonnet-5`, five topics cost $3.09, so a full
set extrapolates to **about $12** — an order of magnitude, not a quote, since
those five are the first in the registry rather than a random sample. No eval
graded those documents: the figures say what a run costs, not whether it is
any good.
