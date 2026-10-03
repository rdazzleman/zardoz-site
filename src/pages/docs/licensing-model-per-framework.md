---
layout: ../../layouts/Doc.astro
title: "Licensing model (per framework)"
description: "PolicyForge 1.7.0 documentation: Licensing model (per framework)."
source: "README.md at PolicyForge 1.7.0, lines 1704-2095"
licensedCommands: ["etl-govramp", "etl-hitrust", "etl-soc2-tsc"]
---

Not all frameworks this project targets are safe to bundle and redistribute
in an open repo. Treat them differently:

| Framework                             | Status                                                                                                                            | How this project handles it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **NIST 800-53 Rev 5**                 | US federal government work — public domain                                                                                        | Bundled directly in `data/frameworks/nist-800-53-r5/`, sourced from NIST's own OSCAL content repository via `policyforge etl-oscal`                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **FedRAMP**                           | US federal government work — public domain                                                                                        | Bundled directly in `data/frameworks/fedramp/`, sourced from the `FedRAMP/rules` consolidated rules dataset via `policyforge etl-fedramp`. Control tailoring only — FedRAMP publishes no machine-readable baseline any more                                                                                                                                                                                                                                                                                                                                              |
| **ARC-AMPE**                          | Published by CMS (federal agency) — public domain                                                                                 | Bundled directly in `data/frameworks/arc-ampe/`, sourced from CMS's published Volume II SSPP workbook via `policyforge etl-arc-ampe`. The Direct Enrollment Entity baseline is zONE-gated, so it is BYOC via `--export`                                                                                                                                                                                                                                                                                                                                                  |
| **HIPAA Security Rule**               | US federal regulation (45 CFR 164 Subpart C) — public domain                                                                      | Bundled directly in `data/frameworks/hipaa-security-rule/`, sourced from eCFR's public API via `policyforge etl-hipaa`, with NIST's official 800-53 crosswalk attached via `policyforge etl-hipaa-crosswalk`                                                                                                                                                                                                                                                                                                                                                             |
| **HIPAA Privacy Rule**                | US federal regulation (45 CFR 164 Subpart E) — public domain                                                                      | Bundled directly in `data/frameworks/hipaa-privacy-rule/`, from eCFR via `policyforge etl-hipaa-privacy`. 18 sections and 863 paragraphs, each under the citation eCFR gives it. **eCFR still prints text a court vacated** (*Purl v. HHS*, 2025); it ships as printed, and the vacated paragraphs are marked, never used for generation, and warned on when cited. This is the project's reading of the judgment, not legal advice. No published mapping to 800-53. Read its README before citing it                                                                    |
| **HIPAA Breach Notification Rule**    | US federal regulation (45 CFR 164 Subpart D) — public domain                                                                      | Bundled directly in `data/frameworks/hipaa-breach-notification-rule/`, from eCFR via `policyforge etl-hipaa-privacy`. 7 sections and 31 paragraphs, each under the citation eCFR gives it. No published mapping to 800-53                                                                                                                                                                                                                                                                                                                                                |
| **ONC certification criteria**        | US federal regulation (45 CFR 170.315) — public domain                                                                            | Bundled directly in `data/frameworks/cfr-170-315-onc-certification/`, sourced from eCFR's public API via `policyforge etl-onc`. **59 live criteria**, one criterion one control, cited as `170.315(g)(10)`. A certification criterion says what a product must be able to do, not what your organization runs. Shipped once with fabricated criteria and withdrawn; this version is refused unless its criteria equal a set two independent sources agree on. Read its README                                                                                            |
| **Information blocking**              | US federal regulation (45 CFR Part 171) — public domain                                                                           | Bundled directly in `data/frameworks/cfr-171-information-blocking/`, sourced from eCFR's public API via `policyforge etl-info-blocking`. **Not a control catalog** — it states the conditions under which a practice is *not* information blocking, so an entry is a condition of an exception rather than a safeguard. No crosswalk, deliberately: read its README before citing it                                                                                                                                                                                     |
| **SUD patient records**               | US federal regulation (42 CFR Part 2) — public domain                                                                             | Bundled directly in `data/frameworks/cfr-42-part-2-sud-records/`, sourced from eCFR's public API via `policyforge etl-part2`. **Two of the part's 38 sections**, § 2.16 and § 2.19 — the rest is conduct (when a disclosure is permitted, what a court must find), and citing a conduct rule as a control asserts a safeguard exists where the regulation says only that a disclosure was lawful. The thinness is deliberate; its README states the test and what it rejected                                                                                            |
| **NIST SP 800-171 Rev 3**             | US government work — public domain                                                                                                | Bundled directly in `data/frameworks/nist-800-171-r3/`, sourced from NIST's OSCAL edition via `policyforge etl-800-171`. **Rev 3**, which is what NIST publishes machine-readable — CMMC Level 2 currently assesses against R2, a different revision with differently shaped identifiers (`3.1.1` against `03.01.01`). Read its README before citing it for a CMMC assessment                                                                                                                                                                                            |
| **NIST AI RMF 1.0**                   | US government work — public domain                                                                                                | Bundled directly in `data/frameworks/nist-ai-rmf/`, sourced from NIST's AIRC via `policyforge etl-ai-rmf`. The whole Core — **19 categories carrying 72 subcategories**. **This catalog states outcomes, not obligations**, so a citation to it can be fully traceable and still commit nobody to anything; NIST puts the actions in the separately versioned, voluntary Playbook. There is deliberately no crosswalk — mapping an outcome to a control would assert the control achieves the outcome, the claim NIST declined to make. Read its README before citing it |
| **NIST AI RMF Playbook**              | US government work — public domain                                                                                                | Bundled directly in `data/frameworks/nist-ai-rmf-playbook/`, sourced from NIST's AIRC via `policyforge etl-ai-rmf-playbook`. NIST's **suggested actions** for each of the 72 AI RMF subcategories — **459 actions**. **The Playbook is voluntary**: a document may say NIST suggests an action, never that NIST requires it. Pinned to one export by its SHA-256, since NIST publishes no revision number. Carries no outcome wording — each outcome is read from the AI RMF catalog. Read its README before citing it                                                   |
| **NIST CSF 2.0**                      | US government work — public domain                                                                                                | Bundled directly in `data/frameworks/nist-csf-2-0/`, sourced from NIST's OSCAL content and NIST's OLIR 186 mapping to 800-53 via `policyforge etl-csf`. 22 categories and 106 subcategories. **CSF 2.0 states outcomes, not obligations**, as the AI RMF Core does. NIST's mapping is untyped and marked not comprehensive, so every link counts as partial coverage. Both files are pinned by SHA-256. Read its README before citing it                                                                                                                                 |
| **GovRAMP**                           | GovRAMP's Terms & Conditions claim ownership of "documents, downloadable files" on their site, with no redistribution grant found | **Not bundled.** Treated as bring-your-own-content (BYOC) via `local_content/` until GovRAMP grants explicit permission (worth emailing info@govramp.org — ask before assuming).                                                                                                                                                                                                                                                                                                                                                                                         |
| **HITRUST AI Security Certification** | Contractually licensed content                                                                                                    | **Never bundled.** An add-on to a CSF assessment, so it is carried alongside `hitrust-csf` rather than instead of it. README-only, and there is no `etl-hitrust-ai` yet — `etl-hitrust` stamps `HITRUST-CSF` on whatever it parses, so it must not be used for an AI export. Read its README before bringing your own                                                                                                                                                                                                                                                    |
| **HITRUST CSF**                       | Contractually licensed content                                                                                                    | **Never bundled.** BYOC only — you supply your own MyCSF/CSF export under your own license, and it's parsed locally. It is never committed, never uploaded anywhere by this tool, and stays out of git via `.gitignore`.                                                                                                                                                                                                                                                                                                                                                 |
| **SOC 2 Trust Services Criteria**     | Licensed by the AICPA; its terms bar derivative works and commercial use, and object to LLM use                                   | **Never bundled.** BYOC only: `policyforge etl-soc2-tsc` reads a text export of your own copy into `local_content/`, and your own copy of the AICPA's 2020 mapping to 800-53 if you have one (read as partial; ids NIST changed since Rev 4 flagged). Nothing is fetched from the AICPA. Read `data/frameworks/soc2-tsc/README.md` first                                                                                                                                                                                                                                 |

## Bringing a second NIST-family catalog: write the catalog's full name

Each NIST-family catalog has its own key — `nist-800-53`, `nist-800-171`,
`nist-800-172`, `nist-800-137`, `nist-csf` — so you can load more than one
and a citation naming one of them cannot resolve against another.

**Cite them by their full names.** `[NIST 800-171 03.01.01]` resolves;
`[NIST AC-2]` does not, once a second NIST-family catalog is loaded, because
`NIST` no longer says which one you mean. An ambiguous citation is reported
as unresolved rather than being attached to whichever catalog happens to be
first — a citation an assessor cannot follow is not evidence, and it is
better to be told than to have it counted.

Nothing changes while you load a single NIST-family catalog, which is what
the bundled set is: `NIST` names exactly one thing and the short form keeps
working.

**If you are upgrading with documents already written**, they carry
`[NIST AC-2]` short-form citations. Those keep resolving as they always have
until you add a second NIST-family catalog; at that point regenerate, and
`satisfies --strict` will fail until you do. That red is the point — it is
the tool declining to guess which catalog you meant.

Earlier releases filed every NIST-family catalog under one key, `nist`, and
merged their requirement identifiers into one set, so an 800-171 identifier
cited as 800-53 was found there and counted as evidence rather than reported.
That is fixed; the history is under "Residual risk" in
[docs/security-architecture.md](https://github.com/rdazzleman/policyforge/blob/main/docs/security-architecture.md).

## Two repositories, two sets of rights

The table above is about **this** repository. Your own is a different
question, and the answer is usually different too.

A HITRUST CSF export must never be committed here — this repo is public and
Apache-licensed, and may hold only content anyone may redistribute. But your
organization's repository, the private one holding your `docs/` tree, your
`topics.yaml` and your config, very often **may** hold that same export,
because your MyCSF licence permits internal use. Telling you to keep your own
licensed catalog outside your own private repo, when your licence allows it,
is a restriction this project has no standing to impose — and it makes CI
harder for nothing.

So the rule isn't "licensed content never goes in a repository". It's
**"licensed content never goes in a repository that hasn't declared the right
to hold it"** — a permission only you can grant, granted once:

```yaml
# your repo's config/config.yaml
frameworks:
  search_paths:
    - data/frameworks     # bundled: 800-53, HIPAA
    - frameworks          # yours, committed alongside docs/
  allow_licensed_in_repo: true    # our MyCSF licence permits this
```

Each catalog directory carries a `framework.yaml` declaring its terms:

```yaml
id: hitrust-csf
name: HITRUST CSF v11.3
framework_id: hitrust-csf   # the key crosswalks, coverage and citations file it under
licence: licensed        # or: public-domain
source: MyCSF export, 2026-01
```

`etl-hitrust` and `etl-govramp` write this file beside the catalog they
import, if there isn't one yet. Without a `framework_id`, a name is keyed by
the built-in table or else by its first word, so every unlisted NIST name
shares `nist`.

`policyforge frameworks` lists what's on disk and where each one stands.
`policyforge check` fails on licensed content committed to a repo that hasn't
declared the right — so **this** repo's CI breaks the moment a HITRUST export
lands in it, while the identical command passes in yours. A directory with no
manifest is treated as licensed: assuming content is freely redistributable
because nobody said otherwise is the mistake with consequences.

**What this does not decide.** Whether a *generated document* citing
`[HITRUST 01.c]` may be redistributed is a question about identifiers,
paraphrase and fair use that depends on your licence and your jurisdiction,
and this tool has no business answering it. What it can do is tell you which
documents drew on licensed catalogs, so the question gets asked about the
right files by someone qualified to answer it.

**Rule of thumb:** if you're not certain a document is a public-domain
government work, it goes in `local_content/` (gitignored), not `data/`.

## Which content may reach which model

The rules above decide which *repository* may hold a file. A second question
has the same shape and a different answer: which *model* may be sent one.
Committing a HITRUST export and pasting it into a hosted API are both
redistribution, and only one of them used to be checked.

`llm/boundary.py` classifies both sides and enforces the pairing before a
call rather than describing it here. Providers are classified by where the
bytes end up:

| Class         | What it means                            | How it's recognised                                  |
| ------------- | ---------------------------------------- | ---------------------------------------------------- |
| `local`       | A model on this machine. Nothing leaves. | A loopback `base_url` — Ollama, llama-server         |
| `self-hosted` | A model you run, over your own network   | An RFC 1918 address, or an `.internal` name          |
| `third-party` | Somebody else's processor                | Anthropic, Bedrock, Vertex, LiteLLM, any public host |

A `local` model is reached directly, whatever proxy the environment names:
PolicyForge's own clients (the `openai-compat` provider, and the embed and
rerank channels) ignore `HTTP_PROXY` for a loopback endpoint, because a
proxy is off this machine and would see the text in cleartext. `litellm`
builds its own clients and can't be told to, so licensed content to a
`litellm` model on this machine is refused while a proxy would carry it.
Add the host to `NO_PROXY` (`NO_PROXY=localhost,127.0.0.1`), or use
`provider: openai-compat` with `base_url` at the same server's `/v1`.

Content is classified by who may hold it — `public-domain` (NIST, HIPAA),
`organization-internal` (your generated documents, your topic registry), or
`licensed` (a MyCSF or GovRAMP export, and anything under `local_content/`).
A catalog the licensed ETLs write also carries `"licence": "licensed"` in the
file itself, so it stays licensed wherever it's saved or moved. Where a
catalog's path and its file disagree, the stricter class wins (#459). The
rule is a ceiling per content class, and only one class is restricted:

```
content                local        self-hosted  third-party
public-domain          yes          yes          yes
organization-internal  yes          yes          yes
licensed               yes          no           no
```

`policyforge boundary` prints that table for your configuration, says what
your provider was classified as and why, and with `--path` classifies
specific files — exiting non-zero on a refusal, so it can gate a pipeline:

```
$ policyforge boundary --path local_content/CSFLibraryReport.csv
Configured provider: third-party (inferred: anthropic is a hosted API)

local_content/CSFLibraryReport.csv
  REFUSED: licensed content -> third-party provider (the ceiling for licensed is local)
  content:  licensed (under local_content, which is kept out of git)
  provider: third-party (inferred: anthropic is a hosted API)
```

**It fails closed in three places.** A provider nobody can classify is
third-party — `provider: local` names the protocol, not the network, so
pointing it at a hosted vLLM endpoint classifies as third-party and the
alias buys you nothing. A cascade is as exposed as its most exposed half,
because which half answers depends on a runtime failure. And a framework
directory with no manifest is licensed, which is the registry's existing
rule.

The inference is inference, and there is one honest case it gets wrong: a
model you host behind a public DNS name. Say so, and the declaration
outranks the guess:

```yaml
llm:
  provider: openai-compat
  base_url: https://llm.internal.example.com/v1
  classification: self-hosted    # ours, despite the public name
```

Ceilings can be tightened in config and cannot be loosened:

```yaml
llm:
  boundary:
    organization-internal: self-hosted    # our own drafts stay inside
```

Loosening a ceiling here is refused deliberately. A declared
`classification` states where a provider is. It never widens the licensed
ceiling, and a declared `local` the endpoint shows is not this machine (a
hosted API, a private-network or public address) is refused, on `llm:`,
`embed:` and `rerank:` alike: `local` means a model on this machine.

**Licensed content to a hosted provider under a data agreement.** If your
organisation has a data agreement that covers sending licensed content to a
hosted provider, declare that provider:

```yaml
llm:
  provider: anthropic
  model: claude-sonnet-5
  licensed_agreement:
    provider: anthropic          # must match llm.provider
    model: claude-sonnet-5       # optional: only this model
    reference: "DPA 2026-02 s.7" # optional: recorded, never checked
```

The declaration names who the agreement is with. For `anthropic`,
`bedrock`, `vertex` and `gemini` the provider name is that party. For
`openai-compat` and the `local` alias, and for `litellm` with an `api_base`,
the provider name only says how the content is sent, so the declaration
carries `base_url` too, and it is matched to your configured endpoint by
scheme, host and port. The scheme is part of the agreement: an `http://`
endpoint is not covered by an `https://` declaration, because plain http
hands the text to every hop in between. A LAN model served over http
declares `http://...`, and the ledger then names the party with its
`http://`. A written default port (`:443` for https, `:80` for http) is the
same endpoint as none. For `litellm` with no `api_base`, it carries `vendor`, matched
to the vendor your model names (`openrouter` for `openrouter/...`):

```yaml
llm:
  provider: litellm
  model: openrouter/deepseek
  licensed_agreement:
    provider: litellm
    vendor: openrouter
```

Licensed content may then reach that party, and only that party (and model,
if named); it keeps its true class. Every call made under the declaration
writes the declaration, and the party it names, into its row in the
model-call ledger, so you can list which licensed calls left the machine and
on what stated basis. A call under the declaration is refused while any
environment variable could move its endpoint, because the SDK could send it
somewhere the declaration does not name. That's any variable whose value
holds an `http://` or `https://` URL, whatever it is called, and any named
`*_BASE_URL`, `*_API_BASE` or `*_ENDPOINT_URL`. The refusal names the
variables, never their values. The standard proxy variables (`HTTPS_PROXY`,
`HTTP_PROXY`, `ALL_PROXY` and `NO_PROXY`, in either case) are exempt when
the endpoint is https, since a proxy routes the connection and the TLS
session still ends at the party you declared. They are not exempt for an
`http://` endpoint, where the proxy reads the text (`NO_PROXY` always is).
**Known limit in this version:** any other variable holding a URL refuses
the call, whether or not your SDK reads it. A CI runner sets several
(`GITHUB_SERVER_URL`, say), so unset them for the run that sends licensed
content.
With no declaration, nothing changes: licensed content reaches only a local
model. Whether an agreement permits a given use is your organisation's
judgement; PolicyForge applies the boundary you configure, consistently. In
this version the declaration covers `llm:` only, not the `embed:` and
`rerank:` channels.

## The record of what was sent where

A rule with no record of its operation is a rule nobody can evidence — which
is the exact criticism the Standards this tool generates make of an
organization that has a policy and no logs. So `llm/ledger.py` records every
model call: provider, provider class, the model that **answered**, the
document or control it was about, token counts, cost, and a SHA-256 prefix
of the prompt.

**Never the prompt and never the reply.** A ledger that quoted what it saw
would take a licensed export that correctly went to a local model and copy
it into a file under `output/`, recreating in the audit trail precisely the
leak the audit trail exists to disprove. The hash is enough to say "the same
prompt" or "a different prompt" without holding either.

Read it back with `policyforge model-log`:

```
$ policyforge model-log --by subject
5 of 5 recorded call(s), by subject:
  standard/authenticator-mgmt      2 call(s)       8400 in      3900 out     $0.0620
  AC-2                             1 call(s)        900 in       300 out     $0.0002
  AC-3                             1 call(s)        880 in       290 out     $0.0002  (1 failed)
  (unattributed)                   1 call(s)        500 in       120 out     $0.0000

Total: 5 call(s), 10680 in / 4610 out, $0.0624
```

`--by model|subject|site|provider|content_class` regroups it, and
`--model`/`--subject`/`--since` filter it — which is how you answer *which
documents did that model touch*, the question that gets asked the day a
model turns out to have been weakening the requirements it cited.

Three details are deliberate. The model recorded is the one that
**answered**, not the one in config, because a cascade that escalated wrote
that document with its stronger half. A **failed** call is still recorded:
it reached the vendor, was billed, and carried its content there, which a
spend-only meter misses. And `$0.0000` and `unpriced` are different answers,
because a local model is genuinely free and a provider that does not price
its calls is unknown.

**A billed cost and an estimated one are told apart too** (#87). Each call
records `cost_source`: `provider` when the vendor reported what it charged,
`estimate` when LiteLLM priced the tokens from its pinned price table because
the vendor didn't say. On a chat call only OpenRouter reports its own cost
today; the other LiteLLM routes are estimates. Every place PolicyForge shows
spend (the line at the end of a run, `model-log`, a re-send warning, and the
stamp in each generated document) prints a plain `$X` only when all of it was
reported by the vendor. Otherwise it names the parts, for example
`$0.2500 billed + $0.1000 estimated`. A log row written by an earlier version
has no source, and its cost is shown as "of unrecorded source", never as
billed.

Calls made outside a named piece of work are recorded as `(unattributed)`
rather than guessed at — a true statement about a run, where an invented
attribution would be indistinguishable from a real one later.

**Generated documents carry the stamp too.** `generate` used to record
`model` into local version history by reading it out of config, which
answers a different question: what was configured most recently, not what
wrote this file. The version-history entry now carries the models that
actually answered, the prompt hashes that produced it, the provider and its
class, and the cost — at no extra cost at generation time, since the ledger
already had it.

`llm.ledger.enabled: false` turns the whole thing off. That is a decision
visible in a file; a ledger that silently dropped what it could not write
would be neither, so a write it cannot make raises instead.

## Generating a BYOC parser from a sample export

The licensed-framework plugin, where installed, handles the MyCSF
renderings that have actually been seen (see
[Reading your export](/docs/status/#reading-your-export)) and the controls matrix
workbook as GovRAMP ships it. Both cover the exports somebody has had in
hand; every org's can differ,
and there is no one column layout to hand-write a parser against ahead of
time. When detection fails — it names the fields or columns it could not
find — or for a framework with no loader at all:

```
policyforge generate-parser --framework hitrust --sample path/to/sample-export.csv
```

This sends the sample's **full content** to your configured LLM provider and
asks it to draft a deterministic parser — no LLM calls at parse time, and
only the imports a parser needs (`csv`, `openpyxl`, `pathlib`, `re` and a
few more standard modules). The candidate is written to
`output/parsers/hitrust_loader.py`, outside the package, where nothing
imports it.

**The candidate is checked before it runs, and run once under watch.** The
sample is part of the prompt, so the code that comes back was written under
the influence of a file this tool did not write — and it is about to run
over a licensed one. `ingest/parser_gate.py` refuses it before it runs if it
imports anything off that list, turns strings into code, reaches through
dunder attributes, or writes anything; a refused candidate is saved as
`*.rejected.py` for you to read and is never executed. A candidate that
passes is run once against the sample in a child process, under an audit
hook that refuses sockets, subprocesses and write-mode opens, and the
command reports how many records it returned. Neither check is a sandbox.
What they change is the default: model output used to be written into
`src/` and imported on the next run; now it is a candidate you promote.
`--promote` copies one that passed both checks into `src/policyforge/ingest/`
— never one that returned nothing, because an empty catalog reads as a
framework with no controls. Read it first either way, then test and commit
it like any other source file.

**For HITRUST the model is asked for less than it used to be.** Earlier
versions asked for finished `Control` objects, which meant every generated
loader re-implemented deduplication, level classification, mapping-string
splitting and control assembly — properties of the framework rather than of
the file, and subtly different every time a model wrote them. Now the model
is asked only to fill in a `hitrust.Record` per row; `hitrust.build_controls`
does the rest, identically for every export shape. The generated code
shrinks to the part that genuinely varies.

**The boundary check runs before the file is read.** A sample export under
`local_content/`, or from a catalog whose manifest says `licence: licensed`,
is licensed content — so this command refuses to run it against a hosted
provider, and `--yes` does not get past the refusal. Point `llm:` at a local
model for the run, or declare the provider as inside your boundary. See
[Which content may reach which model](#which-content-may-reach-which-model).

What the check cannot decide is whether your MyCSF or GovRAMP licence
permits this particular use at all, even locally — the same IP-boundary
concern as the "note on using this at work" section below, in the other
direction. That one is still yours, and the command still asks. This exists
for public-repo maintainers building the parsing logic itself (which contains
no licensed content once written); it is not a way around the licence
question.
