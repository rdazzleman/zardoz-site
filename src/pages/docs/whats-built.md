---
layout: ../../layouts/Doc.astro
title: "What's built"
description: "PolicyForge 1.7.0 documentation: What's built."
source: "README.md at PolicyForge 1.7.0, lines 3095-3292"
licensedCommands: ["etl-hitrust"]
---

What already exists, kept as the record of what the prose above refers to.

- [x] `mapping/crosswalk.py` — cross-framework control correspondence
- [x] `synthesis/merge.py` — the dedupe/merge-to-prose engine
- [x] `generate/policy_writer.py` — Standard tier (`generate_standard`), Policy tier
  (`generate_policy`), and Procedure tier (`generate_procedure`), org-context-aware,
  producing canonical portable markdown (see "Document hierarchy" and "Output format
  priority" above)
- [x] Confluence exporter — converts canonical markdown to Confluence storage format
  via `markdown-it-py`
- [x] Confluence importer (`export/confluence_importer.py`) + local version history
  (`history/version_store.py`) — see "Confluence import and local version history" above
- [x] Amazon Bedrock LLM provider (`llm/bedrock_provider.py`) — install with `pip install "policyforge[bedrock]"`
- [x] `ingest/parser_codegen.py` + `policyforge generate-parser` — LLM-assisted codegen
  for a BYOC loader from a real sample export (see "Generating a BYOC parser from a
  sample export" above)
- [x] HITRUST CSF export parsing, in the licensed-framework plugin
  (distributed separately). Run it with `policyforge etl-hitrust`
- [x] Google Cloud Vertex AI Model Garden LLM provider (`llm/vertex_provider.py`) —
  install with `pip install "policyforge[vertex]"`. Note this serves **Claude**
  models in Google Cloud through Anthropic's client; for Google's own models
  see the Gemini provider below
- [x] Gemini LLM provider (`llm/gemini_provider.py`) — Google AI Studio's API
  key flow, no cloud project and no extra to install
- [x] OpenAI-compatible endpoint provider (`llm/openai_compat_provider.py`) — a model
  running on your own machine (Ollama, LM Studio, llama.cpp's server, vLLM) or any
  hosted endpoint speaking `/v1/chat/completions`, including a LiteLLM proxy. Needs no
  extra: it is built on `requests`, already a dependency. `provider: local` is an alias.
  Running locally is not only cheaper — a licensed HITRUST or GovRAMP export handed to a
  model on localhost never reaches a third-party processor, which is a different answer
  to the licensing question rather than a cheaper one
- [x] LiteLLM provider (`llm/litellm_provider.py`) — most other vendors behind one model
  string (`anthropic/claude-opus-5`, `gemini/gemini-2.0-flash`, `ollama_chat/qwen3:14b`),
  so comparing models across vendors is a one-line config edit. Reports per-call cost in
  `LLMResponse.cost_usd`, which is what makes a quality comparison also a cost one. That
  cost is the provider's own reported figure where it gives one (OpenRouter does);
  otherwise it is LiteLLM's estimate from the price table bundled with the installed
  LiteLLM, plus PolicyForge's small override table (`llm/litellm_map.py`). The table is
  pinned: PolicyForge never downloads a newer one at startup, so estimates age with the
  LiteLLM version and change only when it is bumped (#79). The log records which it was,
  and every display labels an estimate as one (#87).
  Install with `pip install "policyforge[litellm]"`
- [x] `POLICYFORGE_CONFIG` — names a config file to use instead of `config/config.yaml`,
  so a second provider can be run against the same working tree without editing, and
  forgetting to restore, the first one
- [x] Cheap-first cascade (`llm/cascade_provider.py`) — runs one model and escalates to
  a stronger one when the first demonstrably could not finish. The trigger is narrow on
  purpose: only `ReasoningBudgetExhausted`, the one failure the provider layer can see
  for itself. A wrong answer does not escalate, because `generate()` never receives the
  passages a verifier would need
- [x] Tunable short-call budgets (`zardoz/budgets.py`) — routing, expansion and
  resolution were sized for a model that starts answering immediately. A reasoning model
  spends the budget deliberating and returns nothing, and a truncation bills a retry at
  eight times the ceiling, so the original figures scored reasoning models as worse at
  the task *and* cost more. See `MEASUREMENTS.md`
- [x] Deontic strength analysis (`content/deontic.py`) — reports a sentence that carries
  a framework citation and does not bind. The source controls are written in obligation
  language, so a Standard rendering a cited requirement as "teams should consider" has
  downgraded a control while still displaying its citation. Wired into
  `policyforge check` as warnings
- [x] Structured output as an opt-in provider capability (`LLMProvider.generate_json`) —
  routing is constrained by an enum schema where the model supports one, falling back to
  prose where it does not. Turns "did the model reply with exactly one word" from
  something the prompt asks for into something the API guarantees
- [x] `ingest/hipaa_loader.py` + `policyforge etl-hipaa` — HIPAA Security Rule (45 CFR
  164 Subpart C), bundled and populated, sourced from eCFR's public API
- [x] HIPAA-to-NIST-800-53 crosswalk (`ingest/hipaa_crosswalk_loader.py` +
  `policyforge etl-hipaa-crosswalk`) — sourced from NIST's CPRT catalog, *not* SP
  800-66 Rev. 2's PDF: that document's Appendix D states the mapping table was moved
  out of the PDF and into CPRT. `synthesize` now pulls HIPAA requirements into a topic
  alongside NIST/FedRAMP
- [x] `ingest/oscal_loader.py` + `policyforge etl-oscal` — NIST 800-53 Rev 5 from NIST's
  own OSCAL catalog, so 800-53 data can be populated with no pre-existing Obsidian vault
- [x] `ingest/arc_ampe.py` + `policyforge etl-arc-ampe` — ARC-AMPE Volume II, CMS's
  402-item mandatory baseline for an ACA Administering Entity, bundled and populated
  from CMS's published SSPP workbook. The controls sheet is found by its shape rather
  than its name, so the zONE-gated Direct Enrollment Entity workbook reads the same way
  via `--export`
- [x] `ingest/fedramp.py` + `policyforge etl-fedramp` — FedRAMP's control tailoring
  (parameter values and guidance for 79 controls), joined onto the 800-53 text it
  tailors. Read from `FedRAMP/rules`, which is what FedRAMP publishes now that
  `GSA/fedramp-automation` is gone. **Not** a baseline — see below
- [x] `ssp/` + `policyforge ssp` — NIST 800-53 System Security Plan as a LibreOffice-
  compatible .xlsx workbook, with FedRAMP's CIS vocabularies and LLM-drafted
  implementation narratives (see "System Security Plan" above)

### Making "one topic, one team" first-class

Ownership started as a convention you held in your head: `synthesize` took
`--topic "Access Review" --nist-controls AC-2,AC-6` and nothing recorded which
team owned it or what it was for. These turned that into declared, checkable
data. What remains of the idea — per-team bundles, evidence artifacts and the
reverse view — is in theme 2 above.

- [x] **Topic registry** (`config/topics.yaml` + `topics/registry.py`) — topic name,
  owner, cadence, NIST anchors, evidence artifacts, with a 20-topic starter set in
  `config/topics.example.yaml` that fully covers all three baselines
- [x] **Coverage and ownership analysis** (`policyforge coverage`) — orphaned and
  contested controls, unknown vs out-of-scope anchors, per-team rollup, and
  cross-framework reachability via the crosswalk. `--strict` for CI, `--json` for
  downstream tooling
- [x] **Registry wired into `synthesize`/`generate`** — `synthesize --topic-name` pulls
  anchors and the owning team from the registry and records them as frontmatter on the
  synthesis file; `generate` reads them back, so documents name the real team instead
  of `[Responsible Team]`, and carry the topic cadence and evidence artifacts
- [x] **Confluence editing harness** (`edit/` + `policyforge edit-confluence`) —
  instruction -> plan -> review -> execute against a live page, with dry-run by
  default, version-guarded writes, macro round-trip refusal, and a post-edit check
  for dropped citations or sections (see "Editing a live page")
- [x] **Edit a whole topic's document set** (`policyforge edit-topic`) — resolves a
  topic's pages from the registry's `confluence:` block and applies one instruction
  across them, planning each page at its own tier and leaving untouched any page
  whose plan comes back empty; nothing publishes until the whole set is ready
- [x] **The plan is part of the record** — written to `output/edits/<slug>.plan.json`
  and into version-history metadata, and read back with
  `policyforge history --tier confluence`, so what was flagged and what was declined
  survive the terminal scrolling away
- [x] **Zardoz, the conversational read side** (`zardoz/` + `policyforge zardoz`) —
  a REPL over the policy set, with a local corpus that tags each document
  trusted (owner known) or supporting (unowned). Reads only; the publish path is
  kept out of its import graph and a test asserts it
- [x] **Markdown as a first-class source** (`content/`) — sync a tree of files with
  no network and no credentials, so a repo-backed document set is answerable
  offline. Frontmatter binds a file to the page it publishes to; a file without any
  still resolves from its path and first heading
- [x] **Confluence read fidelity for foreign pages** — cross-page links, user
  mentions and images are attribute-only elements markdownify dropped entirely, so
  an Owner field read as blank. Restored before conversion; unresolvable mentions
  render as a conspicuous `@unresolved-user` and are counted by `sync`
- [x] **Zardoz retrieval** (`zardoz/retrieve.py`) — chunks at headings so a citation
  can name a section, scores with BM25 over terms plus exact matching on control
  identifiers, and refuses rather than returning its least-bad chunk. No embeddings:
  `AC-2` and `AC-3` embed almost identically and mean different things to an
  assessor, so a near-miss is a wrong answer, not a close one
- [x] **Zardoz answering** (`zardoz/answer.py`) — grounded prose with a citation
  on every claim, verified after the fact rather than merely requested: a marker
  pointing at a passage that was never supplied, an answer with no citations at
  all, or a quotation that isn't verbatim in the source are each caught and shown
  above the answer. With no model configured the passages are returned instead,
  which is a supported way to run — retrieval is entirely offline
- [x] **Paraphrase recovery** (`zardoz/paraphrase.py`) — when the question's own
  words find nothing, the model names the vocabulary a document would use and the
  search is retried with it, scored at a discount and reported separately. Chosen
  over embeddings: no dependency, no endpoint the default provider lacks, and an
  expansion you can read
- [x] **`policyforge publish`** — walks the content tree and pushes each document
  to the page its own frontmatter declares, so the file-to-page mapping lives in
  the repo under review rather than in a workflow argument. Plans by default;
  refuses to publish over a page whose macros it cannot round-trip, or one
  edited on the wiki since this tool last wrote it and not yet pulled — that
  page is reported as moved and fails the run
- [x] **`policyforge pull`** — the way back. Fetches live pages into the tree as
  markdown with the binding written into frontmatter, so a page somebody
  hand-edited becomes a reviewable diff instead of a surprise. Refuses pages that
  would not survive a later publish rather than writing a file that looks correct
  and destroys them
- [x] **`policyforge wiki-drift`** — which published pages changed on the wiki
  since this tool wrote them, as a question rather than as the reason a publish
  refused. Writes nothing and prints the `pull` command that reconciles each one;
  `--fail-on-change` makes a scheduled run the notification
- [x] **`policyforge check`** — the pull-request gate, entirely offline so it runs
  on a fork with no credentials: frontmatter resolves, no two files claim one
  page, no dangling cross-references, no citations dropped since the synthesis
- [x] **Zardoz analyses** (`zardoz/skills.py`) — coverage, drift, parameters,
  history, check, frameworks and roles reachable from the shell, by name or by
  asking. The model routes and the deterministic report is printed verbatim, so a
  number in a Zardoz answer is worth the same as a number from the CLI
- [x] **Zardoz follow-up questions** (`zardoz/conversation.py`) — "what's our
  access review cadence?" then "who owns that?". The question is resolved against
  the exchange *before* retrieval, since keyword scoring has no mechanism for
  "that", and the rewritten question is always shown: a good guess about intent
  is indistinguishable from a bad one once the answer is written
- [x] **`zardoz discover`** — crawls a space and proposes a draft `topics.yaml`
  from title conventions and inline control citations, using the LLM only for the
  pages those conventions did not reach. Ownership stays `[UNASSIGNED]`: nothing
  in a page reliably says which team is accountable, and a wrong owner in a
  compliance artifact gets believed while a blank one gets filled in
- [x] **Role-keyed tools and teams** (`org/`) — `identity_provider: Okta` says what
  Okta is *for*, which is the only fact a substitution needs. 33 tool roles and 14
  team roles (`policyforge roles`), and the fill happens in code after generation
  rather than in the prompt, so the same document and config give the same output
  every time. A flat `vendors:` list still works
- [x] **Licensed catalogs in your own repository** (`frameworks/`) — a HITRUST or
  GovRAMP export may not be committed here, but your own private repo very often
  may hold it under your own licence. Each catalog declares its terms in a
  `framework.yaml`, and `check` fails on licensed content committed to a repository
  that has not declared the right to hold it
- [x] **Parameter ledger** (`parameters/`, `config/parameters.yaml`) — one decided
  value per organization-defined parameter, with the reasoning and source beside it.
  Substituted into control text *before* synthesis, so every document drawn from a
  control agrees and so does the SSP. An undecided parameter stays visibly
  `[Assignment: ...]` rather than becoming a number nobody chose
- [x] **Framework-version drift** (`frameworks/drift.py` + `policyforge drift`) —
  when a catalog bumps version, reports which controls actually changed and which
  of your topics, documents and recorded parameter decisions each one reaches, so
  review is scoped to what moved rather than restarting the document set. Compares
  against the committed catalog by default, so running the ETL is the whole setup.
