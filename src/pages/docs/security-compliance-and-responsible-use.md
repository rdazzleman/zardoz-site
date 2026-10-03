---
layout: ../../layouts/Doc.astro
title: "Security, compliance and responsible use"
description: "PolicyForge 1.7.0 documentation: Security, compliance and responsible use."
source: "README.md at PolicyForge 1.7.0, lines 2593-2654"
licensedCommands: []
---

This tool writes the documentation your compliance program is assessed on,
which puts it inside that program: it is a thing you have to be able to
account for. [`docs/`](https://github.com/rdazzleman/policyforge/blob/main/docs/) holds that account, written so an adopter — or
their assessor — can check it rather than take it on trust.

**Two things before the links, because they are what an adopter is most
likely to get wrong.** First: **nothing this tool produces is evidence of
compliance.** It produces documents a competent person must read, correct
and own. Second: **on the edit path, model choice is a security control,
not a cost decision** — measured, some models carry out an instruction
planted in a wiki page and some do not.

You do not have to take the rest on trust either. Two commands answer the
central questions directly:

```bash
policyforge boundary    # what may be sent to which provider, and why
policyforge model-log   # what was actually sent where, and what it cost
```

- **[Where PolicyForge sits](https://github.com/rdazzleman/policyforge/blob/main/docs/positioning.md)** — how this compares with
  a compliance automation platform and with HITRUST MyCSF, each quoted from
  its own description, plus the one-page pitch and who it is for.
- **[System card](https://github.com/rdazzleman/policyforge/blob/main/docs/system-card.md)** — the one-page version: intended
  use, prohibited uses, known limitations, data handling. Written to be
  pasted into an AI inventory or a vendor questionnaire. Start here.
- **[Commitments](https://github.com/rdazzleman/policyforge/blob/main/docs/commitments.md)** — eight things this tool promises,
  each with the test that fails when it stops being true. No endpoint the
  operator didn't configure, no credential in a prompt, no content past its
  ceiling, no model-written code into the package unreviewed.
- **[Security architecture](https://github.com/rdazzleman/policyforge/blob/main/docs/security-architecture.md)** — the trust
  boundaries, the content/provider classification that decides what may be
  sent where, the metadata-only model ledger, the untrusted-input inventory,
  the supply-chain posture, and the residual risks that remain after all of
  it. Includes an adoption checklist.
- **[OWASP Top 10 for LLM Applications](https://github.com/rdazzleman/policyforge/blob/main/docs/owasp-llm-top-10.md)** — each of
  the ten risks, the controls in this codebase that address it, the test or
  measurement that holds each control in place, and what is left uncontrolled.
  Three of the ten carry nearly all the real risk here; four are mitigated by
  architecture rather than by engineering, and are labelled that way rather
  than padded.
- **[NIST AI RMF alignment](https://github.com/rdazzleman/policyforge/blob/main/docs/nist-ai-rmf.md)** — which parts of your own
  AI RMF work this tool has already done and which it hands back, mapped
  across Govern/Map/Measure/Manage and the seven trustworthiness
  characteristics. Includes EU AI Act positioning and ISO/IEC 42001 framing.
- **[Subprocessors and data flow](https://github.com/rdazzleman/policyforge/blob/main/docs/subprocessors.md)** — every party that
  can receive your content, what is and isn't sent, and the two configs that
  keep everything inside your boundary. This project has no subprocessors of
  its own; the list is of parties *you* introduce.
- **[Responsible AI use](https://github.com/rdazzleman/policyforge/blob/main/docs/responsible-ai-use.md)** — why a language model
  makes this work *more* accurate rather than less, who it puts the work
  within reach of, what the model is explicitly not allowed to decide, what
  must never be fed into it, and the uses this tool should be refused for.
- **[SECURITY.md](https://github.com/rdazzleman/policyforge/blob/main/SECURITY.md)** — how to report a vulnerability, and what is
  in and out of scope.

If you are contributing rather than adopting,
[CONTRIBUTING.md](https://github.com/rdazzleman/policyforge/blob/main/CONTRIBUTING.md) lists the paths where a change is most
likely to break one of those commitments, and what to do instead of editing
the test that caught it.
