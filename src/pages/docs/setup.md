---
layout: ../../layouts/Doc.astro
title: "Setup"
description: "PolicyForge 1.7.0 documentation: Setup."
source: "README.md at PolicyForge 1.7.0, lines 104-150"
licensedCommands: []
---

## Installing the command (macOS and Linux)

```bash
brew install rdazzleman/tap/policyforge
```

That installs the `policyforge` command from the
[rdazzleman/homebrew-tap](https://github.com/rdazzleman/homebrew-tap) tap,
with the core providers; the optional extras (`bedrock`, `vertex`, `litellm`,
`mcp`) are not included. Without Homebrew, `pipx install git+https://github.com/rdazzleman/policyforge@v1.7.0` does the same, and
takes extras as `policyforge[mcp] @ git+…`.

An installed command has no clone around it, and every command reads
`config/` and `data/frameworks/` relative to where it runs. So start a
project directory first:

1. `policyforge init my-policies && cd my-policies` — writes the bundled,
   public-domain catalogs (NIST 800-53, FedRAMP, ARC-AMPE, the HIPAA Security
   Rule), the example configs, a README for each bring-your-own catalog, and a
   `.gitignore` that keeps your config, topic registry, licensed exports and
   drafts out of version control. It never overwrites a file that is already
   there.
1. `cp config/config.example.yaml config/config.yaml` and fill in your model choice
   and the *name* of the environment variable holding your API key (not the key itself).
1. `export ANTHROPIC_API_KEY=sk-...` (or whatever env var name you configured)
1. `policyforge llm-check` — confirms your API key and model work.

## From a clone, to work on PolicyForge itself

1. `python -m venv .venv && source .venv/bin/activate`
1. `pip install --upgrade pip setuptools` — a fresh venv's own pip/setuptools are
   often a version behind, which otherwise shows up as a confusing false-alarm-feeling
   failure the first time you run `pip-audit` (see "Running the quality checks" below).
1. `pip install -e ".[dev]"` — for local work. CI installs from
   `requirements/ci.txt` instead, a hashed lock resolved for its Linux and
   Python 3.12 rather than for whatever the machine running it has. Change a
   dependency in `pyproject.toml` and the lock needs regenerating with the
   `uv pip compile` command written in its header; Dependabot bumps it
   otherwise. semgrep is not in the dev extra — it has its own lock and
   environment (see CONTRIBUTING.md).
1. `cp config/config.example.yaml config/config.yaml` and fill in your model choice
   and the *name* of the environment variable holding your API key (not the key itself).
1. `export ANTHROPIC_API_KEY=sk-...` (or whatever env var name you configured)
1. `pre-commit install` — sets up the secrets/dependency scanner to run before every commit.
1. `policyforge llm-check` — confirms your API key and model work.
