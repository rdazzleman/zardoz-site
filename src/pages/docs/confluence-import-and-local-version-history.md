---
layout: ../../layouts/Doc.astro
title: "Confluence import and local version history"
description: "PolicyForge 1.7.0 documentation: Confluence import and local version history."
source: "README.md at PolicyForge 1.7.0, lines 871-919"
licensedCommands: []
---

`export/confluence_importer.py` is the reverse of the exporter: it pulls a
page's current content back out of Confluence and converts it to markdown.
Two things this is for:

- **Bootstrapping** a policy that already lives in Confluence (written by
  hand before this tool existed) into the pipeline, so it can be tracked
  going forward.
- **Drift detection**: `policyforge import-confluence --tier <tier> --name <name> ...` records the imported content into the *same local version
  stream* `policyforge generate` uses for that tier/name, so you can diff
  what this tool last generated against what's actually live — e.g. after
  someone hand-edits the published page directly.

Round-trip fidelity (markdown -> Confluence -> markdown) is only guaranteed
for documents this tool itself published — a hand-authored page using
Confluence-native macros (panels, expand blocks, page properties) will
import with those macros passed through as raw HTML rather than clean
markdown.

**Local version history** (`history/version_store.py`) is a lightweight,
offline changelog every `generate` and `import-confluence` run writes into
`output/.history/<tier>/<name>/` — one full snapshot, one unified diff
against the previous version, and one index line per version. Regenerating
identical content is a no-op (it doesn't pad the history). This is **not**
a replacement for your org's actual system of record — Confluence's own
page version history, git history if you commit `output/` somewhere
private, or a GRC platform. It exists because those systems only
see what got *published*; this also captures drafts you regenerated but
never pushed. Since `output/` is gitignored, this history is local to your
machine, not shared or backed up by this repo.

```
policyforge generate --tier standard --synthesis output/synthesis/auth-mgmt.md
# -> Recorded 'standard/auth-mgmt' v1 in output/.history (+42/-0 lines).

policyforge history --tier standard --name auth-mgmt
# -> v1  2026-08-23T22:10:00+00:00  generate  +42/-0  a1b2c3d4e5f6

policyforge import-confluence --tier standard --name auth-mgmt \
  --space ENG --title "Authenticator Management Standard" \
  --host https://yourorg.atlassian.net/wiki
# -> Differs from the last recorded version (v1) — recorded as
#    'standard/auth-mgmt' v2. Run `policyforge history --tier standard
#    --name auth-mgmt --diff 1:2` to see what changed.

policyforge history --tier standard --name auth-mgmt --diff 1:2
# -> unified diff between what was generated and what's actually live
```
