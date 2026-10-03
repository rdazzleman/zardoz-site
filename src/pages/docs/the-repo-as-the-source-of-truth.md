---
layout: ../../layouts/Doc.astro
title: "The repo as the source of truth"
description: "PolicyForge 1.7.0 documentation: The repo as the source of truth."
source: "README.md at PolicyForge 1.7.0, lines 1459-1666"
licensedCommands: []
---

The pipeline above ends at Confluence. It also runs the other way round, with
markdown in a git repository as the source of truth and Confluence as a
publishing target fed from it:

```
policyforge check                    # the pull-request gate, offline
policyforge publish --apply          # tree -> Confluence, on merge
policyforge wiki-drift               # which pages changed on the wiki, and how to reconcile
policyforge pull --apply             # Confluence -> tree, when someone hand-edits
```

That inversion buys what a wiki cannot. A pull request is a review gate with
named approvers and a diff. `git log` is a history nobody can quietly rewrite.
A branch is a draft that doesn't confuse anyone reading production. And a
document set in a repo can be checked *before* it is published rather than
after somebody notices.

Each document names its own destination, so the file-to-page mapping lives in
the repository under review rather than in a workflow argument somebody has to
keep in step:

```yaml
---
title: Access Review Standard
tier: standard
owner: IAM Engineering
confluence:
  space: SEC
  title: Acme Access Review Standard
---
```

A file with no `confluence:` block is never published, which is how a draft
stays a draft. `confluence:` is the short spelling of the general form, a
`targets:` block with one entry per kind of store, `confluence` among them;
both are read the same way, and `check` reports a file that carries both with
different contents.

**`check` is the piece that earns its keep.** It runs with no credentials, so
it works on a pull request from a fork, and it catches what survives review:

| Finding                               | Why it isn't visible in a diff                                                    |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| Two files claiming one page           | Both publish; the second wins; the repo still holds two apparent sources of truth |
| A link to a renamed document          | The prose still reads correctly                                                   |
| A `confluence:` block with no space   | Nothing says where it goes until publish time                                     |
| Citations dropped since the synthesis | The traceability an assessor needs, gone from a paragraph that reads fine         |

Missing owners and tiers are warnings rather than errors — a repo mid-migration
is full of them, and a gate that cannot be satisfied gets switched off. `--strict`
promotes them once you've finished migrating.

## Wiring it to GitHub

`.github/workflows/content.yml` runs the two halves with deliberately
different privileges:

|                | When                    | Credentials                               | Can block a merge |
| -------------- | ----------------------- | ----------------------------------------- | ----------------- |
| `check`        | every pull request      | none                                      | yes               |
| `publish`      | after a merge to `main` | Confluence token, behind an `environment` | no                |
| `publish-wiki` | after a merge to `main` | GitHub token, behind an `environment`     | no                |

`check` needing nothing is what lets it run on a pull request from a fork —
exactly where a gate is worth having. Both publishing jobs are fenced the
other way: only on `push`, only from this repository, and behind a GitHub
environment, because a workflow that could write to a live wiki from an
untrusted pull request is a supply-chain problem rather than a convenience.
Each states `github.event_name == 'push'` in its own condition rather than
trusting the trigger list, so a trigger added later cannot quietly hand a
fork a write path. They plan into the job log before applying, so when a
publish does something surprising there's a record of what it believed it was
doing.

For Confluence, set `CONFLUENCE_HOST` as a repository variable, and
`CONFLUENCE_USERNAME` and `CONFLUENCE_API_TOKEN` as secrets on the
`confluence` environment. The workflow does not pass `--allow-macros`, on
purpose.

For a GitHub wiki, set `WIKI_REPOSITORY` (`owner/name`) as a repository
variable and `WIKI_TOKEN` as a secret on the `github-wiki` environment. The
job deliberately does **not** use the workflow's built-in `GITHUB_TOKEN`: a
credential minted for every run of every workflow is the wrong thing to hold
write access to your policy set. It also does not pass `--allow-public`, so
it refuses a wiki that is public or whose visibility it could not determine
— and documents carrying licensed catalog content are refused for a public
wiki whether or not that flag is added.

## Publishing to a GitHub wiki

A wiki is a git repository of markdown pages, so the same three guards
apply with git's answers: a commit sha where Confluence has a version
number, this tool's commit trailer where it has a version message, the file
itself where it has storage format.

```yaml
# config/config.yaml
publish:
  target: github-wiki
  github_wiki:
    repository: acme/security-policies
    token_env: GITHUB_TOKEN     # optional; your git credential helper otherwise
```

Each document still names its own destination, so the file-to-page mapping
stays in the repository under review:

```yaml
# docs/standards/access-review.md
targets:
  github_wiki: {}               # this wiki, page named by the document title
```

An empty block is the common case. Give it a `title:` when the page should
be named something else, or a `repository:` when one tree publishes into two
wikis. A file with no `github_wiki:` block is not published, which is how a
draft stays a draft.

What differs from Confluence, and why:

- **Any byte difference counts as an edit.** Confluence reflows storage
  format when it saves, so that adapter forgives whitespace between tags. A
  wiki reflows nothing, so a page that differs was changed by somebody and
  is reported rather than overwritten.
- **The report names who changed it**, from `git log`, so you know whom to
  ask before pulling.
- **A page in another format is refused by name.** GitHub wikis accept
  AsciiDoc, RST and six others; publishing markdown over one would replace
  it, so those pages are skipped and named, the way Confluence macros are.
- **Cross-references are rewritten both ways**, from tree paths to
  `[[Page Title]]` on publish and back on pull. A link to a document with no
  wiki page is left exactly as written and reported once.
- **The plan's first line says whether the wiki is public**, every run.
  Unknown visibility counts as public, and publishing to a public wiki needs
  `--allow-public`.

The working clone lives in `output/.wiki/`, which is gitignored.

## Starting from a space nobody catalogued

`policyforge zardoz discover --space ENG` proposes a registry rather than
requiring you to write one:

```
Proposed 14 topic(s) from 61 page(s):

  Access Control    [UNASSIGNED]  [policy, standard]  AC-2, AC-6
                    (3 page(s) sharing the title stem 'Access Control')
  Backup and Restore [UNASSIGNED] [standard]          CP-9
```

Most of the grouping is already written down, just not as data: a governance
space names its pages by convention and cites the same controls across a
related set. Those signals are exact and free, and they place the majority of
a real space with no model involved — which matters for trust as much as cost,
since "these pages share a title stem and cite AC-2" is a reason you can check
and "a model thought so" is not. The LLM sees only the residue, and a page it
can't place is listed rather than forced into a topic.

**Every owner comes back `[UNASSIGNED]`.** Nothing in a page reliably says
which team is accountable — authorship isn't ownership, and the last editor is
usually neither. A wrong owner in a compliance artifact gets believed; a blank
one gets filled in. The file is written to `topics.proposed.yaml`, not
`topics.yaml`, for the same reason.

**Both directions refuse rather than degrade.** A page using `info`, `expand`,
`status` or page-properties macros converts to readable markdown and would be
flattened on the way back. `publish` skips such a page instead of overwriting
work nobody agreed to lose; `pull` refuses it instead of writing a file that
looks correct and destroys the macros the first time it is published. Both name
the page and the macros. `--allow-macros` exists on each and should not be
reached for to get past a skip you haven't read.

## Reading pages this tool didn't write

Bringing an existing Confluence space in asks more of the conversion than
round-tripping our own documents does, and it turned up a real defect.
Confluence stores cross-page links, user mentions and images as `<ac:link>`
and `<ac:image>` elements whose payload lives entirely in *attributes*.
markdownify knows only HTML, so it rendered all three as nothing at all:

| On the page                       | Was read as      | Now reads as                            |
| --------------------------------- | ---------------- | --------------------------------------- |
| `Owner: @Jane`                    | `Owner:` (blank) | the display name, or `@unresolved-user` |
| "see the Access Review Procedure" | "see ."          | the linked page's title                 |
| an architecture diagram           | *nothing*        | `[image: access-flow.png]`              |

The first row is why this mattered enough to fix before anything else. A
blank owner field doesn't read as a gap — it reads as *an answer*, and
"nobody owns this" is exactly the kind of confident wrong that a compliance
tool cannot afford. Where a mention can't be resolved to a name, it renders
as a conspicuous `@unresolved-user` and `sync` reports the count, rather than
leaving an empty cell.

This never mattered before because PolicyForge's own exporter emits only the
`code` macro, so round-tripping its own documents was always clean. It only
surfaces when reading somebody else's page.

**Readable is a lower bar than editable.** There is no required format —
almost any page converts, and headings and tables both survive intact, which
is what chunking, citation and requirements-in-a-table depend on. But a
hand-written page full of `info`, `expand`, `status` and page-properties
macros will be *readable* while `edit-topic` still refuses to touch it,
because writing it back would flatten those macros. `sync` flags those pages
so Zardoz can say "I can answer from this but not safely change it" instead
of drafting an edit that gets refused later.
