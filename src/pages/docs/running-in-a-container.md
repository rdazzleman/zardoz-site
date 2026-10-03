---
layout: ../../layouts/Doc.astro
title: "Running in a container"
description: "PolicyForge 1.7.0 documentation: Running in a container."
source: "README.md at PolicyForge 1.7.0, lines 2515-2591"
licensedCommands: ["etl-govramp", "etl-hitrust"]
---

The image holds the CLI, the four public framework catalogs and a built
crosswalk. It runs as a non-root user, and every dependency comes from a
hashed lock at the versions CI tests. Your own material stays out of it:

```bash
docker build -t policyforge:local .
docker run --rm policyforge:local --help
```

**What the image never contains.** `local_content/` (licensed HITRUST and
GovRAMP exports), `.env`, `config/config.yaml`, `config/topics.yaml` and
`output/`. The build context is an allowlist
([`.dockerignore`](https://github.com/rdazzleman/policyforge/blob/main/.dockerignore)), so a file you add later stays out without
anyone remembering to exclude it. `tests/test_container.py` holds that in
place, and `scripts/ci_in_docker.py` plants such files in a build and checks
the image. An image is something people push, and this project's commitment
that licensed content never reaches a public path applies to it.

**What you mount.** Everything the CLI reads or writes is relative to `/app`,
the same layout as the repository:

| Mount                                               | For                                                                                           |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `config/config.yaml` → `/app/config/config.yaml:ro` | model and provider settings; without it, commands that need no model still work               |
| `config/topics.yaml` → `/app/config/topics.yaml:ro` | the topic registry (`coverage`, `addresses`, `/topics`)                                       |
| `local_content/` → `/app/local_content`             | BYOC exports and the catalogs parsed from them (`etl-hitrust`, `etl-govramp` write back here) |
| a volume → `/app/output`                            | drafts, version history, the synced corpus and the model-call ledger                          |

**Credentials** come in as environment variables, named the way your config
names them. `-e ANTHROPIC_API_KEY` with no value passes the variable through
from your shell, so the key never appears on the command line or in the
image.

```bash
docker run --rm \
  -v "$PWD/config/config.yaml:/app/config/config.yaml:ro" \
  -v "$PWD/config/topics.yaml:/app/config/topics.yaml:ro" \
  -v policyforge-output:/app/output \
  -e ANTHROPIC_API_KEY \
  policyforge:local coverage --controls data/frameworks/nist-800-53-r5/controls.json
```

A named volume for `output/` is writable by the image's user as it is. To
write into a host directory on Linux instead, add
`--user "$(id -u):$(id -g)"` so the files are yours.

The image already has the project layout at `/app`, so `policyforge init` is
not needed to run it. To use the image to lay out a project on the host, for
a clone-free setup, mount the target directory:
`docker run --rm -v "$PWD/my-project":/project -w /project policyforge:local init .`
(add the same `--user` on Linux). A fresh named volume at a new path belongs
to root and the image's user cannot write to it, so use a host directory.

## The MCP server in a container

`policyforge mcp` speaks stdio and binds no port, so a client runs the
container as its command. `-i` keeps stdin open, and `--rm` removes the
container when the client disconnects. For Claude Code:

```bash
claude mcp add policyforge -- docker run -i --rm \
  -v "$PWD/config/topics.yaml:/app/config/topics.yaml:ro" \
  -v policyforge-output:/app/output \
  policyforge:local mcp
```

Any MCP client that takes a command and arguments is configured the same way.
Use absolute host paths in a client's config file, since it may not start in
this directory. The server stays read-only in the container, as it is
everywhere: no tool reaches the publish path. To check that an image's server
answers a client before configuring one:

```bash
python scripts/mcp_smoke.py -- docker run -i --rm policyforge:local mcp
```
