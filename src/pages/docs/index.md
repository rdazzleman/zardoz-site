---
layout: ../../layouts/Doc.astro
title: "Overview"
description: "PolicyForge 1.7.0 documentation: Overview."
source: "README.md at PolicyForge 1.7.0, lines 2-20"
licensedCommands: []
---

**Security compliance documentation for healthcare organizations running
HITRUST and a NIST-based program at the same time.**

PolicyForge turns overlapping control catalogs — HITRUST CSF, the HIPAA
Security Rule, NIST 800-53, FedRAMP, ARC-AMPE — into policies, standards and
procedures an engineer can actually execute, organized so that **every topic
has one clearly accountable owner** rather than being split across teams. It
uses an LLM you bring the API key for, grounded strictly in the control text
you supply rather than the model's own recollection of what a framework
says.

This project separates two things that are easy to accidentally tangle
together: **the engine** (this code — the crosswalk logic, the merge/dedupe
methodology, the generation pipeline) and **the content** (the frameworks
themselves, some of which are freely redistributable and some of which are
not). See [Licensing model](/docs/licensing-model-per-framework/) below before you
add any framework content to this repo.
