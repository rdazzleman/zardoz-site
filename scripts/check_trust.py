"""Checks on the security-and-trust pages (/trust, /compare) and the other site markdown.

These pages are PolicyForge's repository documents, moved here (PolicyForge issue 289).
In the repository, four guards held them; the files they scanned are gone from there,
so the guards live here, in this build:

  1. no internal issue numbers (the repo's test_public_docs_cite_no_issue_numbers)
  2. every page that names a licensed-framework command names the plugin and the contact
     (test_docs_name_the_plugin, first check)
  3. no perishable session names, only stable handles (same test, second check)
  4. every link to the contact address on these pages carries exactly the plugin subject the
     CLI uses (test_docs_plugin_contact_subject); the layout's callout takes it from site.ts

plus two that are new with the move:

  5. every code or test link opens the repository AT THE RELEASE TAG (site.ts `releaseTag`),
     never `main`, so a claim stays checkable against the release it describes
  6. every link between /trust and /compare pages resolves, with its heading id

Run after `npm run build`:

    python scripts/check_trust.py                 the checks, on src/ and dist/
    python scripts/check_trust.py --self-test     each check must FAIL on a planted input
    python scripts/check_trust.py --verify-tree DIR
        every repo link on these pages names a path that exists in DIR, a checkout of the
        release tag. Run at the cut: the pages go live with the release, never before.

Standard library only: CI runs it with the runner's own python.
"""

from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO = "https://github.com/rdazzleman/policyforge"

#: The team's stable handles (CLAUDE.md "stable handle"). Any other `policyforge-<hex><hex>`
#: on a public page is a perishable session name. Copied by hand from the repo's
#: `review_lines.STABLE_HANDLES`: a handle added to the team is added here.
STABLE_HANDLES = {f"policyforge-{h}" for h in ("80", "1d", "9b", "ba", "b5", "5b")}
SESSION_NAME = re.compile(r"\bpolicyforge-[0-9a-f]{2}\b")

PLUGIN = "licensed-framework plugin"
CONTACT = "info@zardoz.io"

# ---- 1. issue numbers (ported from the repo's guard; its rulings carry over) ---------------

_ANCHOR = re.compile(r"\]\(#(?=[^)\s]*[^\d)\s])[^)\s]*\)|href=[\"']#(?=[^\"']*[^\d\"'])[^\"']*[\"']")
_END = r"(?!\w)"
_PREFIXED = re.compile(r"(?<![\w&#/])[A-Za-z]{2,}#\d+" + _END)
_BARE = re.compile(r"(?<![\w&#/])#\d+" + _END)


def issue_citations(text: str) -> list[str]:
    text = _ANCHOR.sub("", text)
    found = [(m.start(), m.group()) for m in _PREFIXED.finditer(text)]
    found += [(m.start(), m.group()) for m in _BARE.finditer(text)]
    return [ref for _, ref in sorted(found)]


# ---- 2. plugin ------------------------------------------------------------------------------

def licensed_commands(commands_ts: str) -> set[str]:
    """The licensed commands, as the site's own command list marks them."""
    return set(re.findall(r'\["(etl-[a-z0-9-]+)",\s*"[^"]*' + re.escape(PLUGIN), commands_ts))


def names_command(text: str, command: str) -> bool:
    return bool(re.search(rf"(?<![\w-]){re.escape(command)}(?![\w-])", text))


def pages_missing_the_plugin(pages: dict[str, str], commands: set[str]) -> list[str]:
    return sorted(
        f"{path}: names {sorted(c for c in commands if names_command(text, c))}"
        for path, text in pages.items()
        if any(names_command(text, c) for c in commands) and (PLUGIN not in text or CONTACT not in text)
    )


class Article(HTMLParser):
    """Visible text, ids and hrefs of <article class="doc-prose">."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.inside, self.skip = False, 0
        self.text, self.ids, self.hrefs = [], set(), []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "article" and "doc-prose" in (a.get("class") or ""):
            self.inside = True
            return
        if not self.inside:
            return
        if tag in ("script", "style"):
            self.skip += 1
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "a" and a.get("href"):
            self.hrefs.append(a["href"])
        self.text.append(" ")

    def handle_endtag(self, tag):
        if tag == "article":
            self.inside = False
        if tag in ("script", "style") and self.inside:
            self.skip -= 1

    def handle_data(self, data):
        if self.inside and not self.skip:
            self.text.append(data)


def parse_page(html: str) -> Article:
    a = Article()
    a.feed(html)
    return a


# ---- 4. contact subject ---------------------------------------------------------------------

#: A link to the contact address: `mailto:info@zardoz.io...`, or the autolink `<info@zardoz.io>`,
#: which renders with no subject and so fails. The query stops at `>` (ported from the repo's test).
_CONTACT = re.compile(r"(?:mailto:|<)info@zardoz\.io(?P<query>[^\s)\"'<>\]]*)", re.IGNORECASE)


def contact_problems(pages: dict[str, str], subject: str) -> list[str]:
    from urllib.parse import unquote

    problems = []
    for path, text in pages.items():
        for number, line in enumerate(text.splitlines(), 1):
            for m in _CONTACT.finditer(line):
                query = m.group("query")
                if query and not query.startswith("?"):
                    problems.append(f"{path}:{number}: {query!r} follows the address, must be ?subject=")
                    continue
                subjects = [unquote(v) for f in query[1:].split("&")
                            for n, _, v in [f.partition("=")] if n.lower() == "subject"] if query else []
                if len(subjects) != 1:
                    problems.append(f"{path}:{number}: {len(subjects)} subject(s), must be 1")
                elif subjects[0] != subject:
                    problems.append(f"{path}:{number}: subject {subjects[0]!r}, must be {subject!r}")
    return sorted(problems)


def plugin_subject() -> str:
    from urllib.parse import unquote

    m = re.search(r'pluginHref:\s*"mailto:info@zardoz\.io\?subject=([^"]+)"',
                  (ROOT / "src" / "lib" / "site.ts").read_text(encoding="utf-8"))
    assert m, "site.ts has no pluginHref in the shape this reads"
    return unquote(m.group(1))


# ---- 7. the stamp ----------------------------------------------------------------------------

#: A page whose figures are not this release's carries its own stamp INSTEAD of "Describes
#: PolicyForge <version>". Named here, by page, so the rule for every other page stays strict
#: (80's ruling, issue 289): a release stamp over figures nobody re-measured would assert a fact
#: nobody measured.
OWN_STAMPS = {
    "/trust/measurements/": "Figures measured 2026-09-12 to 2026-09-29, each as the epoch that ran it records; "
                            "not re-measured for 1.8.0.",
}


def stamp_problems(page_text: dict[str, str], version: str) -> list[str]:
    problems = []
    for url, text in sorted(page_text.items()):
        if url in OWN_STAMPS:
            if OWN_STAMPS[url] not in text:
                problems.append(f"{url}: missing its own stamp")
            if "Describes PolicyForge" in text:
                problems.append(f"{url}: carries a release stamp over figures that were not re-measured")
        elif f"Describes PolicyForge {version}." not in text:
            problems.append(f"{url}: missing the stamp 'Describes PolicyForge {version}.'")
    return problems


# ---- 5. tag pin ----------------------------------------------------------------------------

#: A path ends at whitespace, `)`, `#` or a quote or brace (the `note` in a page's front matter is JSON).
_REPO_LINK = re.compile(re.escape(REPO) + r"/(blob|tree)/([^/\s)\"'}]+)/([^\s)#\"'}]*)")


def untagged_links(pages: dict[str, str], tag: str) -> list[str]:
    return sorted(
        f"{path}: {m.group(0)}"
        for path, text in pages.items()
        for m in _REPO_LINK.finditer(text)
        if m.group(2) != tag
    )


# ---- 6. internal links -----------------------------------------------------------------------

def broken_internal_links(built: dict[str, Article]) -> list[str]:
    """`built` maps a page URL (/trust/x/) to its parsed article."""
    bad = []
    for url, art in built.items():
        for href in art.hrefs:
            if not href.startswith(("/trust", "/compare", "#")):
                continue
            path, _, frag = href.partition("#")
            target = built.get(path if path.endswith("/") or not path else path + "/") if path else art
            if path and target is None:
                bad.append(f"{url}: {href} (no such page)")
            elif frag and target is not None and frag not in target.ids:
                bad.append(f"{url}: {href} (no such heading id)")
    return sorted(bad)


# ---- running it ------------------------------------------------------------------------------

def site_markdown() -> dict[str, str]:
    return {str(p.relative_to(ROOT)).replace("\\", "/"): p.read_text(encoding="utf-8")
            for p in sorted((ROOT / "src" / "pages").rglob("*.md"))}


def built_pages(dist: Path) -> dict[str, Article]:
    out = {}
    for f in sorted(dist.rglob("index.html")):
        rel = f.parent.relative_to(dist).as_posix()
        url = "/" if rel == "." else f"/{rel}/"
        if url.startswith(("/trust", "/compare", "/docs")):
            out[url] = parse_page(f.read_text(encoding="utf-8"))
    return out


def release_tag() -> str:
    m = re.search(r'releaseTag:\s*"([^"]+)"', (ROOT / "src" / "lib" / "site.ts").read_text(encoding="utf-8"))
    assert m, "site.ts has no releaseTag"
    return m.group(1)


def run(dist: Path) -> list[str]:
    problems: list[str] = []
    md = site_markdown()
    assert len(md) >= 30 and "src/pages/trust/index.md" in md and "src/pages/compare.md" in md, (
        f"only {len(md)} site markdown files, or the trust pages are missing: the glob narrowed"
    )
    for path, text in md.items():
        refs = issue_citations(text)
        if refs:
            problems.append(f"issue number: {path}: {refs}")
        for name in sorted(set(SESSION_NAME.findall(text))):
            if name not in STABLE_HANDLES:
                problems.append(f"perishable session name: {path}: {name}")
    trust_md = {p: t for p, t in md.items() if "/trust/" in p or p.endswith("/compare.md")}
    contact_pages = {p: t for p, t in md.items() if "/trust/" in p or p.endswith("/compare.md") or "/docs/" in p}
    problems += [f"contact link: {x}" for x in contact_problems(contact_pages, plugin_subject())]
    assert sum(len(_CONTACT.findall(t)) for t in contact_pages.values()) >= 1, "no contact link found: the pattern stopped matching"
    problems += [f"not at the release tag: {x}" for x in untagged_links(trust_md, release_tag())]

    commands = licensed_commands((ROOT / "src" / "lib" / "commands.ts").read_text(encoding="utf-8"))
    assert commands >= {"etl-hitrust", "etl-govramp", "etl-soc2-tsc"}, f"licensed command set shrank: {sorted(commands)}"
    built = built_pages(dist)
    assert any(u.startswith("/trust") for u in built) and "/compare/" in built, "the trust pages were not built"
    page_text = {u: " ".join("".join(a.text).split()) for u, a in built.items()}
    named = [u for u, t in page_text.items() if any(names_command(t, c) for c in commands)]
    assert named, "no built page names a licensed command: the matcher stopped matching"
    problems += [f"plugin not named: {x}" for x in pages_missing_the_plugin(page_text, commands)]
    trust_text = {u: t for u, t in page_text.items() if u.startswith(("/trust", "/compare"))}
    problems += [f"stamp: {x}" for x in stamp_problems(trust_text, release_tag().lstrip("v"))]
    problems += [f"link: {x}" for x in broken_internal_links({u: a for u, a in built.items()
                                                               if u.startswith(("/trust", "/compare"))})]
    return problems


def self_test() -> list[str]:
    """Every check must fail on a planted input, and pass on its neighbour."""
    fails = []

    def expect(label, ok):
        if not ok:
            fails.append(label)

    expect("issue number: a bare citation", issue_citations("see (#12) there") == ["#12"])
    expect("issue number: a prefixed citation", issue_citations("the GH#459 thread") == ["GH#459"])
    expect("issue number: a colour and an anchor pass", issue_citations("#1e90ff and [x](#2-quick-start) and C#") == [])
    expect("session name: a perishable name fails", [n for n in SESSION_NAME.findall("ask policyforge-d8") if n not in STABLE_HANDLES] == ["policyforge-d8"])
    expect("session name: a stable handle passes", [n for n in SESSION_NAME.findall("policyforge-80 read it") if n not in STABLE_HANDLES] == [])
    cmds = {"etl-hitrust", "etl-govramp", "etl-soc2-tsc"}
    expect("plugin: a page naming etl-hitrust without the plugin fails",
           len(pages_missing_the_plugin({"/x/": "run etl-hitrust on your export"}, cmds)) == 1)
    expect("plugin: the same page with the plugin and contact passes",
           pages_missing_the_plugin({"/x/": f"run etl-hitrust; it needs the {PLUGIN}: {CONTACT}"}, cmds) == [])
    expect("plugin: a longer command name does not match", not names_command("etl-hitrust-extra", "etl-hitrust"))
    stamp = "Describes PolicyForge 1.8.0."
    own = OWN_STAMPS["/trust/measurements/"]
    expect("stamp: a page without the release stamp fails", len(stamp_problems({"/trust/a/": "text"}, "1.8.0")) == 1)
    expect("stamp: a page with it passes", stamp_problems({"/trust/a/": f"x {stamp} y"}, "1.8.0") == [])
    expect("stamp: the measurements page with a release stamp fails",
           len(stamp_problems({"/trust/measurements/": f"{stamp} {own}"}, "1.8.0")) == 1)
    expect("stamp: the measurements page with a release stamp and not its own fails",
           len(stamp_problems({"/trust/measurements/": stamp}, "1.8.0")) == 2)
    expect("stamp: the measurements page with only its own passes", stamp_problems({"/trust/measurements/": own}, "1.8.0") == [])
    subject = "PolicyForge licensed-framework plugin"
    good = f"mailto:info@zardoz.io?subject={subject.replace(' ', '%20')}"
    expect("contact: the plugin subject passes", contact_problems({"p": f"[x]({good})"}, subject) == [])
    expect("contact: another subject fails", len(contact_problems({"p": "[x](mailto:info@zardoz.io?subject=Zardoz)"}, subject)) == 1)
    expect("contact: no subject fails", len(contact_problems({"p": "[x](mailto:info@zardoz.io)"}, subject)) == 1)
    expect("contact: an autolink fails", len(contact_problems({"p": "write <info@zardoz.io> now"}, subject)) == 1)
    expect("contact: a second recipient fails", len(contact_problems({"p": "[x](mailto:info@zardoz.io,other@x.io?subject=a)"}, subject)) == 1)
    tag = "v1.8.0"
    expect("tag: a link at main fails", len(untagged_links({"p": f"[x]({REPO}/blob/main/src/a.py)"}, tag)) == 1)
    expect("tag: a link at the tag passes", untagged_links({"p": f"[x]({REPO}/blob/{tag}/src/a.py)"}, tag) == [])
    a = parse_page('<article class="doc-prose"><h2 id="here">x</h2><a href="/trust/other/#nope">l</a></article>')
    b = parse_page('<article class="doc-prose"><h2 id="there">y</h2></article>')
    expect("link: a missing heading id fails", len(broken_internal_links({"/trust/a/": a, "/trust/other/": b})) == 1)
    expect("link: a missing page fails", len(broken_internal_links({"/trust/a/": parse_page(
        '<article class="doc-prose"><a href="/trust/gone/">l</a></article>')})) == 1)
    return fails


def verify_tree(tree: Path) -> list[str]:
    missing = []
    seen = 0
    for path, text in site_markdown().items():
        if "/trust/" not in path and not path.endswith("/compare.md"):
            continue
        for m in _REPO_LINK.finditer(text):
            seen += 1
            if m.group(3) and not (tree / m.group(3)).exists():
                missing.append(f"{path}: {m.group(3)}")
    assert seen >= 50, f"only {seen} repo links found: the pattern stopped matching"
    print(f"verified {seen} repo links against {tree}")
    return sorted(set(missing))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dist", type=Path, default=ROOT / "dist")
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--verify-tree", type=Path)
    args = ap.parse_args()
    if args.self_test:
        fails = self_test()
        for f in fails:
            print("SELF-TEST FAILED:", f)
        print("self-test:", "FAILED" if fails else "every check fails on its planted input and passes its neighbour")
        return 1 if fails else 0
    problems = verify_tree(args.verify_tree) if args.verify_tree else run(args.dist)
    for p in problems:
        print("PROBLEM:", p)
    print(f"{len(problems)} problem(s)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
