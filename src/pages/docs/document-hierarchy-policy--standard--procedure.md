---
layout: ../../layouts/Doc.astro
title: "Document hierarchy: Policy > Standard > Procedure"
description: "PolicyForge 1.7.0 documentation: Document hierarchy: Policy > Standard > Procedure."
source: "README.md at PolicyForge 1.7.0, lines 1668-1702"
licensedCommands: []
---

Every topic's synthesis output (see `synthesis/merge.py`) can be drafted
into more than one document tier, each with a different audience and level
of detail — `policyforge generate --tier <tier>`:

- **Standard** (`--tier standard`, the default) — the detailed, technical
  document: every synthesized requirement, source-tagged back to the
  frameworks it came from (`[NIST IA-5 | FedRAMP IA-5]`), vendor-specific
  where `org.vendors` allows it. Audience: security/IT staff who implement
  and audit against it.
- **Policy** (`--tier policy`, requires `--standard <path>`) — a short,
  principle-level document read by the whole organization, not just
  practitioners. It compresses the same synthesized requirements into a
  small number of plain-language commitments and drops framework/control
  citations entirely — that traceability lives in the Standard, which the
  Policy references by name in its "Related Standards" section (extracted
  automatically from the Standard document's title, via
  `generate/policy_writer.py`'s `extract_title`).
- **Procedure** (`--tier procedure`, requires `--standard <path>`) — one
  level *more* granular than the Standard: each requirement becomes the
  literal ordered steps a practitioner performs to satisfy it, still
  source-tagged for traceability and referencing the Standard by name the
  same way the Policy does.

Generate a topic's Standard first, then its Policy and/or Procedure from
that Standard:

```
policyforge generate --tier standard --synthesis output/synthesis/auth-mgmt.md
policyforge generate --tier policy --synthesis output/synthesis/auth-mgmt.md \
  --standard output/standards/auth-mgmt.md
policyforge generate --tier procedure --synthesis output/synthesis/auth-mgmt.md \
  --standard output/standards/auth-mgmt.md
```
