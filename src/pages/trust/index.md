---
layout: "../../layouts/Trust.astro"
title: "Security and trust"
description: "PolicyForge 1.8.0 security and trust documentation: Security and trust."
source: "docs/README.md at PolicyForge commit 306eec67, lines 2-71"
release: "1.8.0"
licensedCommands: []
---

Documentation for organizations evaluating or adopting PolicyForge, and for
the assessors who will ask them about it.

PolicyForge drafts security policies, standards and procedures from control
catalogs using a large language model. That places it inside the compliance
program it serves: a tool that writes your control documentation is itself a
thing your program has to account for. These documents exist so that you can
adopt it with a full and accurate picture of what it does, what it sends
where, what it does not protect you from, and what you remain responsible
for.

**Start here:** [System card](/trust/system-card/) is the one-page version — intended use, prohibited use, limitations, data handling. Everything else expands on it.

| Document                                                 | What it covers                                                                                                                                                      |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [System card](/trust/system-card/)                            | The one-pager, written to be pasted into an AI inventory or a vendor review                                                                                         |
| [Commitments](/trust/commitments/)                            | Eight promises, each with the test that fails when it stops being true                                                                                              |
| [Security architecture](/trust/security-architecture/)        | Trust boundaries, data classification, credential handling, the untrusted-input inventory, supply-chain posture, and the residual risks that remain after all of it |
| [OWASP Top 10 for LLM Applications](/trust/owasp-llm-top-10/) | Each of the ten risks, the controls in this codebase that address it, the evidence for each control, and what is left uncontrolled                                  |
| [NIST AI RMF alignment](/trust/nist-ai-rmf/)                  | Which parts of your own AI RMF work this tool has already done, plus EU AI Act positioning and ISO/IEC 42001 framing                                                |
| [Subprocessors and data flow](/trust/subprocessors/)          | Every party that can receive your content, and what you must confirm about each yourself                                                                            |
| [Responsible AI use](/trust/responsible-ai/)              | The case that this is a legitimate use of a language model, the boundaries of that case, and the uses this tool should be refused for                               |
| [Security policy](/trust/security/)                            | How to report a vulnerability                                                                                                                                       |

## How to read these

Every control claim below points at the file that implements it and, where
one exists, the test that holds it in place or the measurement that
established it. Claims are written to be checkable rather than reassuring.
Where a control is partial, the limitation is stated in the same place as
the control rather than collected into a footnote — a reader deciding
whether to adopt this needs both halves in one view.

Two things in particular are stated plainly and repeatedly because they are
the things an adopter is most likely to get wrong:

1. **PolicyForge is a drafting tool, not a system of record, and not an
   assessor.** Nothing it produces is evidence of compliance. It produces
   documents a person must read, correct and own.
1. **What you put into it is your decision and your liability.** The tool
   classifies content and enforces where it may be sent, but it cannot know
   that the paragraph of "company context" you pasted contains patient data.
   See [Responsible AI use](/trust/responsible-ai/#what-must-never-go-in).

## Keeping these honest

Every control claim here names the file that implements it and, where one
exists, the test or measurement that holds it. That is deliberate: a reader
who doubts a claim should be able to falsify it in under a minute.

Several claims in this set were **corrected during review** because the code
did not support them — entailment checking described as an operating control
when nothing called it (it now runs, on the answering path, only if you
switch it on), native citations described as active when they engage only on
some providers, catalog integrity described in general when only one catalog
was stamped. Those corrections are the documentation working as
intended, and each is now stated with its limit in place.

If you find a claim here that the code does not support, that is a security
issue in the sense that matters for this project. See
[the security policy](/trust/security/).

## Version

These documents describe PolicyForge 1.8.0.
The measurements they cite are dated in
[Measurements](/trust/measurements/); the controls they cite are in the
source tree and are covered by the test suite in [tests/](https://github.com/rdazzleman/policyforge/tree/v1.8.0/tests); the
commitments are listed with their tests in [Product security commitments](/trust/commitments/).
