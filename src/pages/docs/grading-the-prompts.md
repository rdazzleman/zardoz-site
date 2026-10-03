---
layout: ../../layouts/Doc.astro
title: "Grading the prompts"
description: "PolicyForge 1.7.0 documentation: Grading the prompts."
source: "README.md at PolicyForge 1.7.0, lines 2097-2216"
licensedCommands: []
---

A prompt cannot be tested against a fixture. Four of them are in Zardoz —
answering, follow-up resolution, paraphrase expansion, skill routing. Three
more write or change documents: the Confluence edit planner and its executor
(`edit_plan`, `edit_apply`), and the drafting prompts behind `generate`
(`generation`), which were the largest unmeasured surface here — every
prompt that actually writes policy. Whether the answerer refuses when the
passages don't support a claim, whether a page can talk the editor into a
change nobody asked for, whether a drafted Standard keeps every citation its
synthesis carried and every "shall" it was given: those are properties of a
model's behaviour, and the only way to know them is to ask the model.

```
python scripts/eval_zardoz.py --repeat 3
python scripts/eval_zardoz.py --suite routing --repeat 20
python scripts/eval_zardoz.py --dry-run      # cost first, calls nothing
```

**One run is not evidence.** That's what the harness is built around. A
truncation bug in the routing budget failed one call in eight, and the first
two probes came back clean — graded once per case it would have shipped. So
every case runs `--repeat` times and the report is a rate:

```
routing: 11/11 cases always pass (110/110 runs, 100%)
```

A fifth suite grades whole **conversations**, driven through the real shell
rather than the underlying functions, because a chain compounds: turn three
is resolved against turn two's resolution, retrieved on the result, and
answered from that. A subject that drifts and is never reclaimed, or a
pronoun binding to the wrong antecedent, cannot appear in a single-turn case
by construction.

Cases run against a **real generated Standard** as well as hand-written
fixtures — bold inside requirement text, an evidence table, multi-clause
source tags, unfilled placeholders. Every clean fixture agreed with the
checks; the realistic one found four false positives in them.

The adversarial answering cases are the ones that earn their keep. A passage
that nearly answers the question, a well-known standards fact absent from the
documents, a question whose premise the documents contradict, a request to
quote exactly, a two-part question the passages answer half of. Two of those
failed 0/8 on their first run and led to a real prompt fix — see below.

A case right seven times in eight is reported as **FLAKY**, not as passing,
and flaky exits non-zero. That distinction is the whole point.

**Grading is deterministic.** No model judges another model's output —
every check is a substring, a citation marker, a refusal sentinel, or one of
the project's own checks: `check_answer` on an answer, `check_edit` on a
revision, `deontic` on whether a cited requirement still binds, and the
source tags a synthesis carried. The same checks that run in production. A grader that needed a model would have the failure mode it
exists to detect. The grading logic itself is unit-tested offline in
`tests/test_eval_harness.py`, because a harness whose scoring is wrong is
worse than none: it produces numbers that look like evidence.

The negative cases are the ones worth writing. A question that must *not*
route to an analysis, a follow-up that must *not* be rewritten, an expansion
that must *not* supply a frequency, a question the passages cannot answer
and must be refused.

## Grading the grader

A suite that passes tells you nothing until you know it *can* fail. So
there is a second harness that measures the first one: delete a numbered
rule from a prompt, rerun the cases, and see which ones notice.

```
python scripts/mutate_zardoz.py --suite routing --pairs
python scripts/mutate_zardoz.py --dry-run
```

A rule no case notices is **unguarded** — either it does nothing and should
go, or the cases have a hole exactly where their evidence should be. Both
answers have come up.

It found three cases that were decided in code before any model was called,
each of which looked like evidence about a prompt and was not:

- an answering case that retrieves zero passages, so `answer_question`
  refuses without ever calling the provider. Stripping the grounding rules
  out of the answering prompt entirely left it green.
- a resolution case whose question `looks_like_a_follow_up` rejects, so the
  rewriter is never asked
- an expansion case asserting only what must *not* appear — which an empty
  expansion satisfies, and `parse_expansion` returns nothing whenever the
  model replies with prose, which is the exact failure the case was written
  to catch. Empty output is now a failure by default in `grade_text`.

All three are worth keeping; they cover the code that short-circuits. What
they are not is evidence about a model, and a green mark does not say which
kind it is. `tests/test_eval_harness.py` keeps an inventory so a fourth has
to be added deliberately.

It also found the opposite. Every routing rule survived its own deletion,
which reads as four dead rules — until you delete "prefer `documents`" and
"if unsure, say `documents`" *together*, and an ambiguous question
("do we have anything covering media sanitization?") misroutes to the
coverage analysis every time. Either rule alone holds the line. They are one
rule written twice, jointly load-bearing, and single-rule mutation can only
report them as dead weight; `--pairs` is what tells those two situations
apart. That question is now a case.

The third answer is that the sweep itself was wrong. The answering
prompt's refusal rule reported as unguarded because the same instruction
sits on the user turn as well as in rule 3, so deleting the rule left the
model told anyway and every refusal case stayed green. Delete both and
five of the six fail. Anything a prompt says twice is invisible to a
mutation that can only reach one copy, so the sweep now pairs each
surviving rule with blanking that companion text — and subtracts what the
companion breaks on its own, because without that a rule gets credited for
failures it had nothing to do with.

That last correction is the same discipline as the baseline: a case counts
as guarding a rule only when removing *that rule* is what broke it.

Deliberately outside `scripts/check.py`: these cost money and need network,
and a gate people can't run offline is a gate people stop running.
