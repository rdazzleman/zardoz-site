---
layout: ../../layouts/Doc.astro
title: "Architecture"
description: "PolicyForge 1.7.0 documentation: Architecture."
source: "README.md at PolicyForge 1.7.0, lines 2433-2513"
licensedCommands: []
---

Catalogs in, documents out, with every model call classified before it leaves
and recorded after it returns:

<figure class="diagram" aria-label="PolicyForge architecture: catalogs are mapped, synthesized, generated and published; model calls pass a boundary check and are recorded in a ledger.">
<svg viewBox="0 0 960 330" role="img" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-arrowhead"/></marker></defs>
<g class="d-box"><rect x="10" y="20" width="190" height="78" rx="8"/><text x="105" y="44" class="d-title">Control catalogs</text><text x="105" y="64">NIST · HIPAA · FedRAMP</text><text x="105" y="82">ARC-AMPE · HITRUST · GovRAMP</text></g>
<g class="d-box"><rect x="228" y="20" width="150" height="78" rx="8"/><text x="303" y="52" class="d-title">map</text><text x="303" y="72">crosswalk</text></g>
<g class="d-box"><rect x="406" y="20" width="150" height="78" rx="8"/><text x="481" y="52" class="d-title">synthesize</text><text x="481" y="72">one topic, merged</text></g>
<g class="d-box"><rect x="584" y="20" width="180" height="78" rx="8"/><text x="674" y="52" class="d-title">generate</text><text x="674" y="72">Policy · Standard · Procedure</text></g>
<g class="d-box"><rect x="790" y="20" width="160" height="78" rx="8"/><text x="870" y="52" class="d-title">publish</text><text x="870" y="72">Confluence or the repo</text></g>
<path class="d-line" d="M200 59H226" marker-end="url(#arr)"/>
<path class="d-line" d="M378 59H404" marker-end="url(#arr)"/>
<path class="d-line" d="M556 59H582" marker-end="url(#arr)"/>
<path class="d-line" d="M764 59H788" marker-end="url(#arr)"/>
<g class="d-pill"><rect x="500" y="168" width="160" height="44" rx="22"/><text x="580" y="195" class="d-title">model call</text></g>
<path class="d-line d-dash" d="M481 98L548 166" marker-end="url(#arr)"/>
<path class="d-line d-dash" d="M674 98L612 166" marker-end="url(#arr)"/>
<g class="d-gate"><rect x="190" y="240" width="220" height="80" rx="8"/><text x="300" y="266" class="d-title">boundary</text><text x="300" y="285">may this content go</text><text x="300" y="303">to this provider?</text></g>
<g class="d-gate"><rect x="690" y="240" width="260" height="80" rx="8"/><text x="820" y="266" class="d-title">ledger</text><text x="820" y="285">provider, model, subject,</text><text x="820" y="303">tokens, cost, prompt hash</text></g>
<path class="d-line" d="M410 262L498 200" marker-end="url(#arr)"/>
<path class="d-line" d="M660 196L752 238" marker-end="url(#arr)"/>
</svg>
</figure>

<details class="diagram-src"><summary>Diagram source (Mermaid)</summary>

<pre><code>flowchart LR
  C["Control catalogs&lt;br/&gt;NIST · HIPAA · FedRAMP&lt;br/&gt;ARC-AMPE · HITRUST · GovRAMP"] --&gt; M["map&lt;br/&gt;crosswalk"]
  M --&gt; S["synthesize&lt;br/&gt;one topic, merged"]
  S --&gt; G["generate&lt;br/&gt;Policy · Standard · Procedure"]
  G --&gt; P["publish&lt;br/&gt;Confluence or the repo"]

  S -.-&gt; LLM(["model call"])
  G -.-&gt; LLM
  B["boundary&lt;br/&gt;may this content go&lt;br/&gt;to this provider?"] --&gt; LLM
  LLM --&gt; L["ledger&lt;br/&gt;provider, model, subject,&lt;br/&gt;tokens, cost, prompt hash"]

  classDef gate fill:#fff3cd,stroke:#8a6d3b,color:#000
  class B,L gate</code></pre>

</details>

`map` makes no model call. The boundary check runs before each call and
raises rather than warns; the ledger records metadata and never content. Both
are described in
[Security, compliance and responsible use](/docs/security-compliance-and-responsible-use/).

```
config/                  Your local config (model, API key env var name, chosen frameworks)
data/frameworks/         Bundled, redistributable framework data (NIST, FedRAMP, ARC-AMPE)
local_content/           Gitignored. Drop your own HITRUST/GovRAMP exports here.
src/policyforge/
  llm/                    Provider abstraction. Ships Anthropic, Amazon Bedrock
                          (`pip install "policyforge[bedrock]"`), Google Cloud
                          Vertex AI Model Garden (`pip install "policyforge[vertex]"`),
                          and Gemini via an AI Studio key (no extra needed) —
                          adding another provider means one new class, no changes to
                          calling code.
  ingest/                 Parses framework sources (bundled markdown, BYOC exports) into
                          a common Control/Element schema.
  mapping/                Cross-framework control crosswalk logic.
  synthesis/              Topic-themed merge/dedupe engine (the "30 synthesis docs" pattern).
  generate/               Turns synthesized requirements + org context into draft
                          policies/standards/procedures.
  edit/                   LLM-driven editing of live Confluence pages
                          (`policyforge edit-confluence`, `edit-topic`): plan.py
                          turns an instruction into a reviewable plan, apply.py
                          carries it out and checks nothing else was damaged, and
                          session.py runs the fetch/plan/rewrite sequence over a
                          whole topic's document set. See "Editing a live page".
  content/                The markdown content tree: documents as files, resolved
                          into tier/owner/published-page whether or not they carry
                          frontmatter, plus check.py's offline pull-request gate.
                          Shared, not Zardoz-specific — it's the reading half of a
                          repo-backed document set, and talks to no network.
  zardoz/                 The conversational read side (`policyforge zardoz`):
                          art.py is the floating head and every persona string,
                          shell.py the REPL, corpus.py the local document
                          snapshot over markdown and/or Confluence, retrieve.py
                          the chunking and ranking that finds the passage a
                          question is about, answer.py the grounded answering
                          and the checks that verify its citations, and
                          conversation.py the follow-up resolution that makes it
                          a conversation, paraphrase.py the vocabulary expansion
                          that runs only after a miss, and discover.py the topic
                          proposal for an uncatalogued space. Never imports the
                          publish path.
  ssp/                    Builds a NIST 800-53 System Security Plan as an .xlsx
                          workbook (`policyforge ssp`), with LLM-drafted
                          implementation narratives. See "System Security Plan" below.
  export/                 Markdown / Confluence exporters, the Confluence importer
                          (pulls a page's content back out, converts it to markdown,
                          restoring the links/mentions/images markdownify drops),
                          and confluence_search.py for finding pages by CQL.
  history/                Local, offline version history of generated/imported
                          documents (output/.history/) — see "Confluence import and
                          local version history" above.
scripts/
  vault_to_data_etl.py    One-time helper: converts an existing Obsidian vault's NIST
                          control notes (public-domain content only) into this project's
                          data schema.
```
