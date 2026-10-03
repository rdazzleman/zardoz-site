/**
 * The docs sidebar, grouped by what a reader is trying to do. The pages
 * themselves are generated from the PolicyForge 1.7.0 README (src/lib/docs.ts);
 * this file only orders and groups them, plus the site's own pages.
 *
 * Every generated page must appear in exactly one group: Doc.astro throws at
 * build time otherwise, so a page can't silently drop out of the sidebar.
 */
import { docsNav } from "./docs";

export type DocLink = { title: string; href: string };

const extra: Record<string, DocLink> = {
  commands: { title: "Command reference", href: "/docs/commands/" },
};

const groups: { label: string; slugs: string[] }[] = [
  { label: "Start here", slugs: ["index", "quickstart", "setup", "the-problem-this-solves"] },
  {
    label: "Writing documents",
    slugs: [
      "one-topic-one-team",
      "company-context",
      "organization-defined-parameters",
      "document-hierarchy-policy--standard--procedure",
      "output-format-priority",
      "system-security-plan-ssp",
    ],
  },
  {
    label: "Frameworks and licensing",
    slugs: [
      "licensing-model-per-framework",
      "status",
      "your-organizations-crosswalk",
      "handling-a-framework-update",
      "input-adapters",
    ],
  },
  {
    label: "Publishing and history",
    slugs: [
      "confluence-import-and-local-version-history",
      "editing-a-live-page",
      "the-repo-as-the-source-of-truth",
    ],
  },
  { label: "Asking questions", slugs: ["zardoz-asking-questions-instead-of-running-commands"] },
  {
    label: "Running it",
    slugs: ["architecture", "running-in-a-container", "security-compliance-and-responsible-use"],
  },
  { label: "Reference", slugs: ["commands", "whats-built"] },
  {
    label: "For contributors",
    slugs: ["grading-the-prompts", "repo-hygiene--scanning", "a-note-on-using-this-at-work"],
  },
];

const bySlug = new Map<string, DocLink>(
  [...docsNav.map((d) => [d.slug, { title: d.title, href: d.href }] as const), ...Object.entries(extra)],
);

const placed = groups.flatMap((g) => g.slugs);
const unplaced = docsNav.map((d) => d.slug).filter((s) => !placed.includes(s));
const twice = placed.filter((s, i) => placed.indexOf(s) !== i);
const unknown = placed.filter((s) => !bySlug.has(s));
if (unplaced.length || twice.length || unknown.length) {
  throw new Error(
    `docs sidebar: unplaced ${unplaced.join(", ") || "none"}; placed twice ${twice.join(", ") || "none"}; unknown ${unknown.join(", ") || "none"}`,
  );
}

/** Groups for the sidebar, with resolved titles and links. */
export const docsGroups = groups.map((g) => ({ label: g.label, links: g.slugs.map((s) => bySlug.get(s)!) }));

/** Every docs page in sidebar order, for previous and next links. */
export const docsOrder: DocLink[] = docsGroups.flatMap((g) => g.links);
