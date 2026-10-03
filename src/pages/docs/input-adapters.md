---
layout: ../../layouts/Doc.astro
title: "Input adapters"
description: "PolicyForge 1.7.0 documentation: Input adapters."
source: "README.md at PolicyForge 1.7.0, lines 822-845"
licensedCommands: ["etl-govramp", "etl-hitrust", "etl-soc2-tsc"]
---

Ingestion is pluggable: every loader in `ingest/` parses one source format
into the same `Control` schema, and nothing downstream (mapping, synthesis,
generation, export) knows or cares which one produced the data.

| Loader                                                | Command                                      | Reads                                                                                                                                                                                       |
| ----------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `oscal_loader.py`                                     | `etl-oscal`                                  | NIST's OSCAL release of SP 800-53 — the default way to populate 800-53 data                                                                                                                 |
| `hipaa_loader.py`                                     | `etl-hipaa`                                  | eCFR's XML for 45 CFR 164 Subpart C                                                                                                                                                         |
| `hipaa_crosswalk_loader.py`                           | `etl-hipaa-crosswalk`                        | NIST CPRT's HIPAA-to-800-53 OLIR catalog                                                                                                                                                    |
| `arc_ampe.py`                                         | `etl-arc-ampe`                               | CMS's ARC-AMPE Volume II SSPP workbook — Volume I is the narrative PDF and holds no controls                                                                                                |
| `fedramp.py`                                          | `etl-fedramp`                                | FedRAMP's consolidated rules dataset — tailoring for 79 controls, joined onto the 800-53 text it tailors. No baseline; see below                                                            |
| `nist_vault_loader.py`                                | `etl-vault`                                  | Markdown notes in one specific shape (YAML frontmatter + `## headings` + `[[wikilinks]]`) — the format this project started from                                                            |
| the licensed-framework plugin, distributed separately | `etl-hitrust`, `etl-govramp`, `etl-soc2-tsc` | Your own licensed HITRUST CSF export (CSV/TSV/XLSX/HTML/MHTML), GovRAMP controls matrix (XLSX/XLSM), or copy of the AICPA Trust Services Criteria. Without the plugin, each command says so |
| `levelled.py`                                         | —                                            | Not a loader: what a catalog stated per level *is*, once its rows are read (HITRUST CSF's shape) — the four tiers, levels vs overlays, and the authoritative-source crosswalk               |

`nist_vault_loader.py` is the only one that touches Obsidian-flavoured
markdown, and it's an *option*, not a dependency — `etl-oscal` needs nothing
but network access. It's kept because it reads one thing the OSCAL catalog
doesn't carry: a "Cross-Framework Mappings" table, which is currently the
only route to FedRAMP crosswalk data. Nothing about it is Obsidian-specific
at runtime; point it at any directory of markdown in that shape and it works
identically.
