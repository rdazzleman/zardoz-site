---
layout: ../../layouts/Doc.astro
title: "Repo hygiene / scanning"
description: "PolicyForge 1.7.0 documentation: Repo hygiene / scanning."
source: "README.md at PolicyForge 1.7.0, lines 2656-2714"
licensedCommands: []
---

Before every commit and on every push, this repo is designed to run:

- **ruff** — lint and format, replacing the flake8/isort/black stack with one tool.
  It's the consistency gate: rule selection, line length (100) and per-file ignores
  live in `[tool.ruff]` in `pyproject.toml`, so the pre-commit hook, CI and
  `scripts/check.py` all enforce byte-identical formatting instead of three
  near-identical configs drifting apart. Beyond style it selects rule families that
  catch real defects — `B` (bugbear), `BLE` (blind excepts must be deliberate),
  `F` (unused imports, undefined names) and `SIM`.
- **gitleaks** — scans staged changes for API keys, tokens, and secrets so you never
  accidentally commit your Anthropic key or an employer-specific config.
- **pip-audit** — checks dependencies for known CVEs.
- **bandit** — static analysis for common Python security issues in this codebase.
- **semgrep** — broader open-source SAST (`p/python`, `p/security-audit`,
  `p/owasp-top-ten` community rulesets), catching patterns bandit's Python-specific
  ruleset doesn't — e.g. it's what caught this repo's GitHub Actions using mutable
  version tags (`@v4`) instead of pinned commit SHAs, a real supply-chain hardening
  gap bandit has no rules for.
- **mdformat** — checks that any markdown this project generates (or that lives in the
  repo itself) is well-formed CommonMark. This is the enforcement mechanism behind
  the "Markdown is the primary deliverable" requirement above, not just a style nit.

Two more run continuously rather than per-commit/per-push:

- **CodeQL** (`.github/workflows/codeql.yml`) — a second SAST engine alongside semgrep,
  using data-flow/taint-tracking analysis rather than pattern matching, so it catches a
  genuinely different class of bug (e.g. untrusted input reaching a dangerous sink
  across multiple function calls). Runs the `security-extended` query suite rather than
  the default — the default is tuned to keep false positives low on very large
  codebases, and this repo is small enough to absorb the extra noise in exchange for
  wider coverage. Runs on push/PR to `main` and weekly on a schedule; results land in
  the repo's Security tab.
- **Dependabot** (`.github/dependabot.yml`) — unlike pip-audit's point-in-time CI check,
  this watches continuously and opens a PR the moment a new CVE is published against a
  Python dependency or a GitHub Action this repo uses, with a 7-day cooldown before
  proposing any newly published version (so a malicious or broken release has time to
  get caught upstream first). It also keeps this repo's SHA-pinned GitHub Actions (see
  ci.yml) current — Dependabot resolves and updates the pinned SHA, not just tag-based
  references. **Enabling Dependabot alerts/security updates is a separate step** — go to
  the repo's Settings → Code security and analysis and turn them on; committing
  `dependabot.yml` alone doesn't enable it.

See `.pre-commit-config.yaml` and `.github/workflows/ci.yml`.

## Running the quality checks yourself

`python scripts/check.py` runs every check in one command — ruff (lint),
ruff (format), pytest, bandit, semgrep, pip-audit, mdformat, plus gitleaks
if you have the binary installed (see the script's docstring for why
gitleaks is optional locally but always runs in CI). Lint and format run
first, since they're the fastest and the most likely to fail on a fresh
edit. Exits non-zero if anything fails, so it's safe to use as a pre-push
gate.

To fix rather than just report, run `ruff check --fix src tests scripts`
and `ruff format src tests scripts` — or install the pre-commit hooks
(`pre-commit install`), which do both automatically on commit.
