---
layout: "../../layouts/Trust.astro"
title: "Security policy"
description: "PolicyForge 1.8.0 security and trust documentation: Security policy."
source: "SECURITY.md at PolicyForge commit 306eec67, lines 45-82, 89-113"
release: "1.8.0"
licensedCommands: []
note: {"text": "To report a vulnerability, use GitHub's private vulnerability reporting. How to report, what to expect and when, and which versions are supported are in SECURITY.md in the repository.", "linkText": "Report a vulnerability", "href": "https://github.com/rdazzleman/policyforge/security/advisories/new"}
---

## Scope

**In scope:**

- Anything that sends content past its configured boundary ceiling — that is
  the tool's central guarantee. See
  [`llm/boundary.py`](https://github.com/rdazzleman/policyforge/blob/v1.8.0/src/policyforge/llm/boundary.py).
- Prompt injection that survives the fence, or corpus text that steers the
  planner on the edit path. Note the **known** planner gap, documented under
  [residual risk](/trust/security-architecture/#residual-risk) — a new
  instance of the known gap is useful, but is not a new finding.
- Anything that escapes `parser_gate`'s static check *and* its audit hook to
  reach the filesystem, network, or a subprocess.
- Credential or licensed-content leakage into the ledger, version history,
  generated output, or any committed path.
- A publish path that destroys a live wiki page the guards should have
  protected.
- The usual: injection, path traversal, unsafe deserialization, dependency
  vulnerabilities with a demonstrated path.

**Out of scope:**

- **Model output being wrong.** The tool drafts documents that a person must
  review; inaccuracy is the documented operating condition, not a
  vulnerability. Systematic grounding failures are interesting — report them
  as bugs with a reproduction.
- **`parser_gate` not being a sandbox.** It is documented as not being one. A
  bypass of a specific check is in scope; the general observation is not.
- **The injection scanner missing a phrasing.** It is a word list by design
  and documented as one. A phrasing that is *common* in real corpora is worth
  reporting.
- Vulnerabilities in your model provider, in Confluence, or in a
  self-hosted model you run.
- Anything requiring an attacker to already have code execution as the user
  running the tool. PolicyForge runs with exactly that user's privileges by
  design.
- Findings from an automated scanner with no demonstrated path.

## What this project already runs

Reports that duplicate a check already in CI are usually already known. On
every push and pull request: ruff, gitleaks (full history), pip-audit,
bandit, semgrep (`p/python`, `p/security-audit`, `p/owasp-top-ten`),
mdformat, and pytest. CodeQL `security-extended` runs on `main` and weekly.
Dependabot watches dependencies and SHA-pinned actions with a seven-day
cooldown.

Run the whole set locally with `python scripts/check.py`.

## Further reading

- [System card](/trust/system-card/) — the one-page summary
- [Commitments](/trust/commitments/) — eight promises, each with its
  enforcing test. **Start here if you are trying to work out whether
  something is a bug or a documented design limit**
- [Security architecture](/trust/security-architecture/) — trust boundaries,
  data classification, the untrusted-input inventory, and residual risk
- [OWASP Top 10 for LLM Applications mapping](/trust/owasp-llm-top-10/)
- [NIST AI RMF alignment](/trust/nist-ai-rmf/)
- [Subprocessors and data flow](/trust/subprocessors/)
- [Responsible AI use](/trust/responsible-ai/)
- [CONTRIBUTING.md](https://github.com/rdazzleman/policyforge/blob/v1.8.0/CONTRIBUTING.md) — the paths where a change is most
  likely to break a commitment
