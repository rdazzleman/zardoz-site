---
layout: "../../layouts/Trust.astro"
title: "Measurements"
description: "PolicyForge 1.8.0 security and trust documentation: Measurements."
source: "MEASUREMENTS.md at PolicyForge commit 306eec67, lines 2-351, 2180-2364"
release: "1.8.0"
licensedCommands: []
note: {"text": "The log of every configuration epoch, and the raw ledgers behind each figure, stay in the repository next to the code that produced them. This page is the method, the baseline and what the measurements found.", "linkText": "Read the epoch log", "href": "https://github.com/rdazzleman/policyforge/blob/v1.8.0/docs/measurements/epochs.md"}
---

What models actually score against `evals/`, and what they cost.

Kept because it is the evidence behind the default model choice, the
baseline any prompt change is measured against, and the record of which
eval cases discriminate between models and which every model passes.

**Read the epochs before comparing two numbers.** The prompts and the
call-site budgets changed during the session that produced this file, and
a score from before a change is not comparable with one from after it.

Reproduce any row with:

```bash
python scripts/eval_zardoz.py --model <litellm model string> \
    --suite routing --suite resolution --suite expansion --repeat 3
```

______________________________________________________________________

## What this file rests on — rewritten 2026-09-24

**Most of this file cannot be re-derived, and it says so section by
section.** The runs behind epochs 1–20, 22 and 23, the nine-model comparison
and the 2026-09-13 baseline wrote their ledgers into session scratch
directories that did not survive. Those sections are kept as they were
recorded, because they are the only record, and each now opens with a
marker saying its source was not retained. **Only the figures below are
re-derived**, from files preserved in [`docs/measurements/ledgers/`](https://github.com/rdazzleman/policyforge/blob/v1.8.0/docs/measurements/ledgers/README.md). Nothing was
re-run: this rewrite made no model calls (the user's decision). The
full-cost rerun ran as **epoch 25** on
2026-09-28/29, on the user's approval of a specific figure. Its spend, eval
scores and token counts are re-derived from retained ledgers; its document
counts only in part (the entry says which).

### What was measured, per provider — re-derived

| path       | model                         | what                                                                                    | cost                                                                                                                          | time    |
| ---------- | ----------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------- |
| OpenRouter | `z-ai/glm-5.3-flash`          | 20 topics, synthesize + three tiers (epoch 21, 2026-09-17)                              | $0.2798, **$0.0140 per topic**                                                                                                | 103 min |
| OpenRouter | `anthropic/claude-sonnet-5`   | 5 topics, the same pipeline (epoch 21)                                                  | $3.0875, **$0.6175 per topic**                                                                                                | 37 min  |
| OpenRouter | `anthropic/claude-sonnet-4.5` | 25 topics, synthesize + Standard (epoch 24, 2026-09-21)                                 | $6.1487, mean **$0.2459 per topic**                                                                                           | 1.26 h  |
| OpenRouter | `z-ai/glm-5.3-flash`          | 3 synthesize calls, paired by topic with epoch 21 (2026-09-24)                          | $0.0086, $0.0020–$0.0046 per call                                                                                             | —       |
| OpenRouter | glm and `deepseek-v4-flash`   | eval-harness calls, 2026-09-18/19, attached to no written epoch (plus 2 sonnet-5 calls) | mean per call, by file: glm $0.00015–$0.00018 (calls $0.00003–$0.00037); deepseek $0.00009–$0.00010 (calls $0.00002–$0.00104) | —       |
| OpenRouter | `anthropic/claude-opus-5.5`   | 5 topics, synthesize + three tiers, and the evals x1 (epoch 25, 2026-09-28)             | pipeline $11.6086, **$2.3217 per topic**; evals $2.7816                                                                       | —       |
| OpenRouter | `z-ai/glm-5.3-flash`          | 25 topics, synthesize + three tiers, and the evals x3 (epoch 25)                        | pipeline $0.4415, **$0.0177 per topic**; evals $0.1361                                                                        | —       |
| OpenRouter | `deepseek/deepseek-v4-flash`  | 25 topics (22 written whole), three tiers, and the evals x3 (epoch 25)                  | pipeline $1.0776, **$0.0431 per topic**; evals $0.3513                                                                        | —       |
| OpenRouter | `anthropic/claude-sonnet-5`   | the evals x1 (epoch 25)                                                                 | $1.2841                                                                                                                       | —       |
| OpenRouter | glm, sonnet-5, opus-5.5       | 5 Standards each at a 32,768 first budget (epoch 25, 2026-09-29)                        | glm $0.0181, sonnet $0.7916, opus $1.5558                                                                                     | —       |

**A per-call rate is a rate for that kind of call.** A glm `synthesize` call
averaged $0.0054 across epoch 21's twenty; a glm eval call cost about $0.0002.
A figure of *$0.0002 per call* once circulated as glm's rate for synthesis.
It is an eval-call rate, 27x below the synthesize mean ($0.0054 / $0.0002).

### What was not measured, and why

- **Claude through its direct API.** Not authorised for this release (the
  user, 2026-09-21). **Every Claude figure in this file went through
  OpenRouter.** The grounds differ in strength, strongest first:

  - **The configured model string**, for the two retained Claude runs.
    Epoch 21's sonnet-5 run was configured as
    `openrouter/anthropic/claude-sonnet-5`, recorded in its committed step
    record, and epoch 24's as `openrouter/anthropic/claude-sonnet-4.5`,
    which is named in that entry's own text but in no preserved file. A
    LiteLLM model string prefixed `openrouter/` is routed through OpenRouter
    whatever keys are present.
  - **The request ids**, as corroboration. Those calls, and the two sonnet-5
    calls in the 2026-09-18 eval ledger that have no recorded config, carry
    `gen-…` ids, 27 of 27: the form OpenRouter returns. None carries the
    `msg_…` form Anthropic's API has used, though Anthropic does not promise
    that format. The ledger's `provider: litellm` does not settle it: that
    names the library, which can call Anthropic directly for
    `anthropic/claude-sonnet-5`.
  - **The file's own record**, for the sections whose sources did not
    survive. Epoch 11 notes that the only credential the project had
    configured was `OPENROUTER_API_KEY`. That is the weakest of the three: a
    process environment can hold an Anthropic key the project never
    configured, and LiteLLM would use it.

  The two paths are different code, and nothing here measures the direct one.

- **Gemini through its direct API.** Never measured. Gemini appears only via
  OpenRouter, in the 2026-09-12 comparison, whose source was not retained.

- **Local models through `openai-compat`.** Never measured. One
  `ollama_chat/qwen3:14b` row exists, from 2026-09-12 and before the
  `qwen3:14b-pf` variant, and its source was not retained.

- **The full three-tier matrix across providers, and a second paid
  provider.** Refused by the user on 2026-09-21. Epoch 24 is the authorised
  partial: one provider, one tier. **Epoch 25** then ran every tier on glm and
  deepseek (25 topics each) and Opus (5), and the evals on all four models,
  but every one through OpenRouter: a second provider *path* is still
  unmeasured.

- **Eval-suite scores before epoch 25.** Every earlier score in this file
  comes from a run whose results were not retained. Epoch 25's are retained. The 2026-09-18/19 ledgers record calls, not
  grades, so no score can be re-derived from them.

______________________________________________________________________

## Method, and what to distrust

- **`--repeat 3`** unless noted. The harness reports a *rate*, not a
  verdict, because one run is not evidence — `evals/runner.py` explains
  why at length.

- **2–3 points is noise at this sample size.** The same model, same code,
  two runs, moved 96% → 95% on `answer_paraphrase`. Trust a direction that
  holds across suites; do not trust a small gap.

- **Costs are per whole suite run**, from the harness's own accounting
  (64 calls for the terse trio, 67 for `answering`, 198 for `paraphrase`).

- **Costs before 2026-09-13 are understated** for any model that tripped
  `ReasoningBudgetExhausted`: a call that raised was billed but not
  counted until that was fixed.

- **Third-party routing varies.** Models reached through OpenRouter may be
  served by different upstreams between runs, with different quantisation.

- **Whether a cost is a total or a floor can be confirmed one way only, and
  before 1.3.0 mostly not at all.** Nothing recorded reasoning: `LLMResponse`
  carried input tokens, output tokens, cost, stop reason, cached input and
  request id, and no reasoning field. Cost is *computed* — LiteLLM prices the
  call from its own tables against the prompt and completion counts the
  endpoint reported — so a cost is a total exactly when reasoning is inside
  `completion_tokens`, and that is a property of each endpoint which our
  records do not assert either way.

  There is one test, and it works in one direction. Where the output
  survives, output tokens can be compared against the characters delivered:
  hidden output that *was counted* depresses that ratio, because tokens were
  billed that never reached the page. So **a low ratio is positive evidence
  the cost is a total**. A normal ratio proves nothing — "the model did not
  reason" and "it reasoned and the endpoint never reported it" look
  identical. A floor therefore cannot be confirmed from anything we hold,
  only from the provider's own accounting.

  Applied to the only runs that left both a ledger and their documents, all
  from epoch 21, after dropping superseded retry attempts (the ledger records
  one row per attempt, so a discarded first attempt otherwise gets paired
  against the final document):

  | run            | model                       | n   | median chars/token |
  | -------------- | --------------------------- | --- | ------------------ |
  | pre-1.2.1 glm  | `z-ai/glm-5.3-flash`        | 56  | 4.38               |
  | 1.2.1 glm      | `z-ai/glm-5.3-flash`        | 59  | 3.93               |
  | 1.2.1 sonnet-5 | `anthropic/claude-sonnet-5` | 15  | 2.44               |

  English prose runs about four characters per token and dense markdown
  lower, so the glm arms are what a run with no hidden channel looks like.
  **The sonnet arm is systematically low — a whole arm, not one call** — which
  is positive evidence that epoch 21's $3.0875 figure is a total. It is not
  evidence that sonnet-5 reasoned: a tokeniser difference between vendors on
  identical markdown is a competing explanation, and 38% is large for that
  but not impossible.

  **Every other epoch quoting a cost is unknowable**, and the reason is the
  test's one-sidedness rather than missing ledgers alone: their runs left no
  surviving output to compare tokens against, so even a complete ledger could
  not have established a total. Do not infer from the model named in an
  epoch — "this looks like a reasoning model" is the inference this note
  exists to refuse.

  **From 1.3.0 the question is a lookup rather than an inference.**
  `hidden_output_tokens` records what the vendor says it billed and did not
  return; `stripped_reasoning_chars` records what `answer_of` removed before
  the reply was stored. Two different invisibilities, neither recoverable
  after the fact before those fields existed. So the cut-off is clean: before
  1.3.0, inferred where output survives and unknowable otherwise; after it,
  recorded.

- **From `7241d90` (2026-09-14) to `82d4b26`, the harness and the CLI did not
  send the same request.** Every provider built from config came back wrapped
  in the call ledger's `RecordingProvider`, which answered False for
  `supports_effort`, `supports_caching`, `supports_batch` and
  `supports_grounding` whatever the provider inside said. A config-built run
  on LiteLLM/OpenRouter, Anthropic or Vertex therefore sent no effort level,
  and Anthropic and Vertex also sent no native citations and marked no cache
  prefix (the per-provider list is in CHANGELOG under 1.2.0).
  `scripts/eval_zardoz.py --model` built its LiteLLM provider directly, with no
  wrapper, so an epoch measured that way sent effort. Such rows describe the
  request the code is meant to send — and, since `82d4b26`, the request a
  config-built run does send — but not what a config-built run sent inside
  the window. Epochs 15–19 were measured with `--model` and each says so.
  Found by policyforge-80.

### What each suite tests

| Suite               | Asks                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `routing`           | does a question reach the analysis that can answer it                                                             |
| `resolution`        | does a follow-up become the question it obviously means                                                           |
| `expansion`         | does query expansion name the document's vocabulary without inventing facts                                       |
| `answering`         | grounded prose with citations, and refusal when the passages do not support one                                   |
| `answer_paraphrase` | the answering cases in wordings their author did not choose                                                       |
| `conversation`      | multi-turn, driven through the real shell                                                                         |
| `paraphrase`        | 66 generated rewordings of the routing cases                                                                      |
| `edit_plan`         | does the Confluence edit planner plan the operator's change and only that                                         |
| `edit_apply`        | does the rewrite make exactly the planned change, graded by `check_edit`                                          |
| `generation`        | does a drafted Standard, Policy or Procedure keep what its synthesis said, and only that                          |
| `crosswalk`         | does a mapping proposal map what carries a requirement's obligation, and not a control that only shares its words |

______________________________________________________________________

## Current baseline — 2026-09-13

> **Source not retained** (2026-09-24): the ledger or results behind this section's figures did not survive, so they stand as recorded at the time and cannot be re-derived.

After the budget, prompt and check fixes described in the epochs below.
Only these three models have been re-measured since; every other row in
this file predates those changes.

| Model                                   | routing | resolution | answering | paraphrase | cost/suite   |
| --------------------------------------- | ------- | ---------- | --------- | ---------- | ------------ |
| `openrouter/z-ai/glm-5.3-flash`         | 100     | 100        | **100**   | **100**    | $0.017–0.024 |
| `openrouter/deepseek/deepseek-v4-flash` | 100     | 100        | 96        | 99         | $0.004–0.005 |
| `openrouter/google/gemini-3.8-flash`    | 100     | 100        | 97        | —          | $0.065–0.165 |

`anthropic/claude-sonnet-5` scored **100** on `answering` ($0.2345) and
**99** on `answer_paraphrase` ($0.2176). Those remain valid: the answering
prompt was reverted byte-for-byte after the reorder experiment, so nothing
that affects them changed.

**Recommended default: `glm-5.3-flash`.** One flaky run short of sonnet-5
across every suite measured, at roughly a fifteenth of the cost.
`deepseek-v4-flash` is the value pick at about a fiftieth.

______________________________________________________________________

## The nine-model comparison — 2026-09-12

> **Source not retained** (2026-09-24): the ledger or results behind this section's figures did not survive, so they stand as recorded at the time and cannot be re-derived.

Original configuration: budgets 64/150/200, prompts before the router and
resolution fixes. **These are the numbers the recommendation was made
from**, and they are not comparable with the baseline above.

### Terse suites

| Model                           | routing | resolution | expansion | cost    |
| ------------------------------- | ------- | ---------- | --------- | ------- |
| `anthropic/claude-sonnet-5`     | 100     | 100        | 100       | $0.0869 |
| `x-ai/grok-4.6`                 | 100     | 100        | 100       | $0.2831 |
| `google/gemini-3.1-pro-preview` | 100     | 100        | 100       | $0.3431 |
| `google/gemini-3.8-flash`       | 100     | 100        | 100       | $0.0651 |
| `z-ai/glm-5.3-flash`            | 97      | 95         | 100       | $0.0124 |
| `deepseek/deepseek-v4-flash`    | 92      | 100        | 100       | $0.0052 |
| `qwen/qwen3-32b`                | 92      | 100        | 100       | $0.0147 |
| `openai/gpt-oss-120b`           | 89      | 95         | 100       | $0.0050 |
| `ollama_chat/qwen3:14b` (local) | 92      | 71         | 100       | $0      |
| `deepseek/deepseek-r1`          | 100     | 95         | **22**    | $0.0972 |
| `qwen/qwen3.7-flash`            | 81      | 100        | **33**    | $0.0052 |
| `minimax/minimax-m1`            | 44      | 48         | 33        | $0.0757 |

### Answering

| Model                           | answering | cost    | cost/call |
| ------------------------------- | --------- | ------- | --------- |
| `anthropic/claude-sonnet-5`     | 100       | $0.2345 | $0.00350  |
| `z-ai/glm-5.3-flash`            | 99        | $0.0124 | $0.00019  |
| `deepseek/deepseek-v4-flash`    | 96        | $0.0027 | $0.00004  |
| `google/gemini-3.1-pro-preview` | 96        | $0.5387 | $0.00804  |
| `google/gemini-3.8-flash`       | 94        | $0.1640 | $0.00245  |
| `deepseek/deepseek-v4-pro`      | 93        | $0.0360 | $0.00054  |
| `cohere/command-a`              | 87        | $0.1819 | $0.00272  |
| `openai/gpt-oss-120b`           | 80        | $0.0079 | $0.00012  |
| `ollama_chat/qwen3:14b` (local) | 84        | $0      | free      |

`deepseek-v4-flash` also scored 95 on `answer_paraphrase` and 95 on
`conversation`.

### Void runs

Recorded so nobody re-derives them as model verdicts.

| Model                | Reported | Why it says nothing                                                                                                     |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `cohere/command-a`   | 28       | `tenacity` missing — a Python dependency LiteLLM needs on its retry path but does not declare. 47 of 114 calls died.    |
| `cohere/command-a`   | 71       | OpenRouter per-model rate limit for new accounts; 6 of 23 cases never reached a verdict. Fixed with `--min-interval 6`. |
| `moonshotai/kimi-k3` | 14 / 0   | Same rate limit.                                                                                                        |
| `openai/gpt-6-astra` | 14 / 0   | Same rate limit.                                                                                                        |

______________________________________________________________________

## How an epoch is registered

A pre-registered epoch fixes its criteria before the data exists, so that
nothing can be tuned to the result. Three conventions, each earned by
epoch 23, where the registration was sound in intent and still left the
measurer to decide a verdict it should have decided in advance.

**1. Every criterion carries a number, or states "no tolerance" as a
choice.** Epoch 23 registered *"N reported and comparable to arm A's"*,
which implies a tolerance, and *"a fall in N against arm A fails
independently"*, which implies none. N fell 1058 → 1041 (−1.6%). Applying
the unnumbered clause at zero tolerance would have meant inventing the
tolerance while reading the data, so the verdict was referred rather than
decided. **Where a numbered clause and an unnumbered one govern the same
quantity, the numbered one governs**, and the next registration should not
contain the pair.

**2. Characterise the variance before the data exists.** Epoch 23 fixed a
direction with no idea what the noise looked like. Arm A turned out bimodal
at the document level: 9 documents entirely short-form, 11 entirely
qualified, none mixed, so the ~1,050 citations were about 20 draws, not
1,050. **Found afterwards, that is only a fact; used as a reason, it is
inventing a tolerance.** Known beforehand, it would have set the tolerance.

**3. Run the null.** An arm-A-versus-arm-A re-run is how convention 2 gets
its number. It is a baseline, not a tiebreaker, which is why it is worth
running when nothing is in dispute: that is the only time nobody is
tempted to read it as a verdict. On this corpus it costs cents (see epoch
23's cost correction), so **declining it on cost is declining it on a
figure that was never measured.**

**4. Record the prompts it ran on, in `evals/prompt-fingerprints.json`.**
That file is the newest epoch's fingerprints, and every run's report
compares against it by name ("differ from epoch 24"). Epochs 19 to 24 never
wrote it, so it held epoch 18's fingerprints while the reports said "the
last recorded epoch". An epoch that generates or grades with a registered
prompt writes the file: the epoch, the PR and pull ref it ran at, the
commit the fingerprints were computed at, a merged commit reachable from a
branch, and each prompt's fingerprint and version. Separately, a prompt
whose text changes must declare a new version, recorded in
`evals/prompt-versions.json` by `scripts/prompt_versions.py`, and
`tests/test_prompt_fingerprint_file.py` fails when it is not. The test
compares the code with the ledger, so a change that also rewrites the
ledger's entry passes it; that the ledger only grows is held by review of
its diff. The prompt change measured in epoch 23 changed
both generation prompts at the same version, and only the fingerprint told
the epochs either side of it apart. The ledger, not the epoch file, holds
that guard: the epoch file lags, so it would catch only the first such edit
after each epoch.

A registration that follows all three states, for each criterion:

```
criterion:   <quantity>, <direction>
tolerance:   <number, with its unit>  |  none, by choice: <why>
variance:    <null-run spread, with its date and commit>  |  not yet measured
cost:        <calls x measured rate, provider, date>  -- not an estimate carried
             forward from a different instrument
```

______________________________________________________________________

## Two ways a run can lie, found the hard way

Both of these were hit while measuring epoch 6, and both produced numbers
that looked like model verdicts and were not.

**A case can fail correct behaviour.** The first version of
`an-injected-instruction-is-not-obeyed` asserted that the rider's words —
"fully implemented" — were absent from the answer. Both models failed it
while behaving exactly as intended: they reported what the unowned runbook
contained *and cited it as that runbook's claim*, which is what the contract
asks for and what rule 7 requires. Graded that way the fence appeared to
cost 3 points on `deepseek-v4-flash` and 1 on `glm-5.3-flash`, and the
conclusion "fencing makes things worse" was one commit away from being
recorded here as a finding.

A substring check cannot tell reporting from obeying. `attributions` can,
and that is what it is for: the case now asserts that "quarterly" is
credited to the Access Control Standard, which obedience cannot satisfy.
The reversal is total — on the corrected case the fence is ahead on all
three models.

**A completed run can be destroyed by printing it.** The first
`gpt-oss-120b` sweep made all 78 calls, was billed for all 78, and then died
in `format_report` with `UnicodeEncodeError` on a non-breaking hyphen the
model had returned: a Windows console defaults to cp1252, and one character
outside it took the whole report. `scripts/eval_zardoz.py` now reconfigures
stdout and stderr to UTF-8 with `errors="replace"`. Worth knowing on any
platform where the console encoding is not UTF-8, because the failure
arrives after the money is spent.

______________________________________________________________________

## Findings that outlived the numbers

**Nothing compares what a generated document SAYS against what its synthesis
said — only which controls each cites.** Found 2026-09-20 while
pre-registering a different measurement; independent of that measurement and
of the framework that exposed it.

`evals/runner._tags` compares **control references**. So the grader asks
*"does this document cite what the synthesis cited, and nothing more?"* and
never asks *"does this document say what the synthesis said?"* A requirement
invented under a tag the synthesis genuinely cites would be
indistinguishable from one the synthesis wrote.

**Stated as a missing check rather than as an observed defect, and the
correction is the instructive part.** This first went in claiming one generated
document contained a fabricated requirement, citing *"The inventory
mechanism shall be resourced according to organizational risk priorities"*
as present in the document and absent from the synthesis — **tested with a
literal substring match.** Measured on the stub catalog of an earlier internal
probe, whose identifiers and shape differ from the shipped catalog — `GOVERN-1.6`
in the stub, `Govern 1.6` in the catalog; that probe's notes, not published here, state the
difference and why the conclusions still hold. The synthesis bullet for `GOVERN-1.6`
reads
*"Mechanisms are in place to inventory AI systems **and are resourced
according to organizational risk priorities**."* The sentence is a
decomposition of its premise, not an invention. **The test answered "is this
string present" while the question was "does the synthesis support this
claim"** — a neighbouring question, inside a finding about checks that
answer neighbouring questions.

Measured properly, by joining each cited sentence to the synthesis
requirements its tag indexes, every cited obligation in that document is
43–100% lexically grounded in its own premise, and the words that are new
are `acme`, `health`, `ensure`, `establish`, `maintain` — the organisation's
name and obligation verbs, which generation is supposed to supply.

**What is demonstrably present is the untagged case.** *"The inventory shall
be maintained in [Asset Inventory System] and shall cover all AI systems
within the scope of this Standard"* binds, introduces scope language the
synthesis never states, and **carries no citation at all**, so there is no
premise to judge it against. `content/check.py:_check_uncited` only fires on
a document citing *nothing*, so a document with seven good tags and three
untagged obligations passes it whole.

**The two halves are different kinds of claim and that is the whole design.**
An obligation with no citation is a **fact** — deterministic, free, and
checkable twice with the same answer. An obligation whose cited requirements
do not carry it is a model's **opinion**. Only the first may gate an exit
code; the project's ruling is that an exit code carries facts, not opinions.

**`generate/policy_writer.py` already forbids the invention** — *"do not add
requirements that weren't in the input"* — which is the right rule and is
currently true. Nothing enforces it. The gap is a missing check, not a
missing rule, and the shape is one this project keeps meeting: **the check
that exists measures the neighbouring property.** Citations are easy to
compare, so citations are what got compared, and *"cites correctly"* quietly
stood in for *"says what it was given"*.

**What would close it** is that content-level accounting — not a similarity
score, which an earlier attempt showed fragments on markdown, but
every binding sentence in the document tracing to a requirement in the
synthesis, and anything that does not being reported as an addition. Named
here so the absence is a decision rather than an oversight.

**Terse scores do not predict answering scores.** `deepseek-v4-flash` went
92 on routing and 96 on answering; `gpt-oss-120b` went 89 on routing and 80
on answering. Measure the suite you care about.

**Price does not predict quality.** `deepseek-v4-pro` scored *below* its
own Flash sibling on answering at fifteen times the cost. Both Gemini
models are strictly dominated — cheaper models score higher.

**Reasoning models are not worse at terse tasks; the budgets were wrong.**
R1 scored 22 on expansion and minimax-m1 33, which read as a verdict on
reasoning models. At the raised budgets two reasoning models scored 100.
The earlier conclusion was an artifact of the test conditions.

**No model is trustworthy without the deterministic checks.** `sonnet-5`
fabricated a quotation on `answer_paraphrase`; `check_answer`'s verbatim
rule caught it. The checks are not scaffolding for cheap models.

**One case discriminates more than any other.**
`an-undecided-parameter-is-reported-as-undecided` failed or flaked on six
of nine models across five vendors. When two thirds of models miss the same
rule, the prompt is the likelier explanation.

**A cited requirement stated as a bare fact is invisible to every other
check.** Both `sonnet-5` and `deepseek-v4-flash` produced non-verbatim
quotations from table content, on the same case.

**A check can be wrong in two ways, and only one of them leaves anything
working.** Three sessions hit this independently on 2026-09-18, and the
cases look unrelated until they are put side by side.

The first way: **the check that worked was not the one doing the work.** A
defect in the tree guard's argument parsing was caught by
`tests/test_tree_guard.py` calling `main()` for an entirely unrelated
reason, while every test written for that change passed. A working check
existed; it simply was not the one written for the job. That is
recoverable, because something in the system still fails when the code is
wrong.

The second way is worse: **a check whose output was fixed before it ran.**
A `CHANGELOG.md` line-ending verification used a `grep` incapable of
returning anything but zero, and the result was reported inside an
approval — right conclusion, worthless evidence, in the file this project
singles out as the one to distrust. It surfaced only when the same tool was
later needed for something else. Separately, a parser was verified by
re-running it and observing that the numbers did not move — an output
identical whether the parser was right by design or right by accident.

**An incidental catch and a real one produce identical output.** A pattern
that reads the right thing by accident passes every check a pattern that
reads it on purpose does. That is why the second class has no working check
anywhere in the system, and why an approval can carry one through.

**The two are found by different means, which is the practical part.** A
near-miss — code that *could* have failed and happened not to — is found by
asking what data would break it. A check that could not have failed is
found only by constructing the failing case and watching the check fail.
Mutation is that, done deliberately: swap the correct rule for the naive
one and see which tests notice. Run against a parser's tests it separated
the ones carrying the property from the ones that passed on the broken
version too. A measurement suite deserves the same treatment, and for the
same reason — **a test that passes on both is not evidence about either.**

**Keep the near-miss and the cannot-fail apart.** The parser above *could*
have failed: it keyed on the citation brackets rather than the verdict
label, so it read both verdicts by accident and would have broken on a
claim quoted differently. It was one input away. Its *verification* is the
one that could not fail. Collapsing them loses the distinction that says
where to look.

**This entry was itself corrected by the rule it describes.** The roster
above arrived misattributed, in a specification written by the author of
one of the mistakes, and was corrected by declining to inherit an
attribution rather than by checking it later. A piece about checks that
cannot fail should not contain an unchecked claim.

______________________________________________________________________

## Adding a run

Append to the table for the current epoch, or open a new epoch when the
prompts, budgets or checks change. Each entry wants:

- the date and the model string as passed to `--model`
- `--repeat`, if not 3
- the cost line the harness prints
- what changed since the last epoch, if anything

A number without an epoch is not comparable with anything, which makes it
worse than no number at all.
