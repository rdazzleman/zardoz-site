---
layout: ../../layouts/Doc.astro
title: "Output format priority"
description: "PolicyForge 1.7.0 documentation: Output format priority."
source: "README.md at PolicyForge 1.7.0, lines 847-869"
licensedCommands: []
---

**Markdown is the primary deliverable.** Everything this project generates
must be correct, well-formed, portable CommonMark first:

- No Obsidian-specific syntax in generated output — standard `[text](path)`
  links, not `[[wikilinks]]`; no vault-relative-only paths.
- Consistent heading hierarchy, properly closed code fences, well-formed
  tables — markdown that renders correctly unmodified on GitHub, in a plain
  text editor, or pasted into any wiki.
- Enforced, not just intended: `mdformat --check` runs in pre-commit and CI
  against anything generated into `output/` during development, the same
  way gitleaks/bandit/pip-audit enforce the security scanning requirements.

**Confluence export is a secondary, additional feature — not a second
generation path.** `export/confluence_exporter.py` converts the *same*
canonical markdown produced above into Confluence storage format, rather
than the generation step producing Confluence content independently. That's
deliberate: it's the only way to guarantee both outputs are actually
correct, since there's only one thing to get right upstream. If Confluence
needs something markdown can't express well (e.g. Confluence-native macros),
that's a transform-time enrichment on top of the canonical markdown, not a
fork of the generation logic.
