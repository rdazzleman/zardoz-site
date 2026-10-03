---
layout: ../../layouts/Doc.astro
title: "A note on using this at work"
description: "PolicyForge 1.7.0 documentation: A note on using this at work."
source: "README.md at PolicyForge 1.7.0, lines 2716-2725"
licensedCommands: []
---

If you plan to install and run this against your employer's compliance work, check
your employment agreement's IP-assignment / moonlighting clause first — many
agreements assign the employer rights to side projects that overlap your job duties,
even when built on personal time, especially in security roles. Keeping the *engine*
(this repo) and your *employer-specific content* (control status, vendor names,
internal workflow docs) in entirely separate places — this repo vs. a private,
non-public vault — is what keeps that boundary clean. Never commit employer-specific
content, org context, or exported policies to this public repo.
