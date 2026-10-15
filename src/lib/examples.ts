/**
 * The /examples page's content: PolicyForge run for real on public-framework
 * topics (PolicyForge issue 286). Three models over the full registry `init`
 * writes for the fictional Roritor Health (80's 6635, the user's "choose fewer
 * models"); the six-topic first pass on seven models was rejected by the user on
 * 2026-10-13 and is not shown.
 *
 * The run: 25 topics under 11 Policies, from 456's `init` on Roritor's scope
 * facts, owners from the profile's teams, reply budgets opened to each model's
 * maximum, by b5 from 2026-10-13 ~19:25 CDT (286 comment 6636). Its tree is
 * C:\policyforge-local\example-output\roritor-full\ on the team's machine. The
 * run doesn't record its PolicyForge commit, so the page names the release
 * branch only.
 *
 * Every figure is copied from that run, never written by hand: a model's cost
 * is the sum of `cost_usd` over its ledger rows (every one `cost_source:
 * provider`, i.e. what OpenRouter billed), the topic cost is that sum over the
 * topic's rows, the time is the wall clock from its first ledger row to its
 * last (the hosted models ran as parallel workers), "topics finished" is the
 * union of its workers' `completed`, and the document counts are the files in
 * its standards/, procedures/ and policies/.
 *
 * The comparison excerpts are files in src/content/examples/, cut from each
 * Standard by line range and checked to be a verbatim slice of it; each names
 * its source lines. They are never edited here.
 *
 * `demo` is the ask-Zardoz transcript, which the page does not show in 1.8:
 * the user moved the Zardoz demos to 1.9 (to 5b, 2026-10-13). It is kept for
 * that release. `standIn` marks an answer copied from the PolicyForge docs,
 * over a different document set; every one must be replaced before the demo
 * is shown.
 */

export type Model = {
  key: string;
  label: string;
  id: string;
  where: string;
  /** The ledger total for the pass, as OpenRouter billed it; null until the run exists. */
  costUsd: number | null;
  costSource: "billed" | "estimated" | null;
  /** The ledger total misses billed spend, so the true cost is higher. */
  floor?: boolean;
  /** The comparison topic's cost alone (its synthesis, Standard and Procedure steps). */
  topicUsd: number | null;
  minutes: number | null;
  /** Of the run's topics, how many got both a Standard and a Procedure. */
  topicsDone: number | null;
  docs: { standards: number; procedures: number; policies: number } | null;
  /** What went wrong, in one line, when a model didn't finish everything. */
  outcome?: string;
};

export type Draft = { model: string; path: string | null; note?: string };

export type Turn = {
  question: string;
  shows: string;
  /** "answer", "refusal" or "report": how the reply is styled. */
  kind: "answer" | "refusal" | "report";
  /** Shown above the answer when Zardoz rewrote or widened the question. */
  note?: string;
  answer: string | null;
  cites: string[];
  standIn?: boolean;
};

const HOSTED = "Hosted, via OpenRouter";

export const examples = {
  /** "run": the run's figures and excerpts are shown; `repoUrl` and `confluenceUrl` add
   * the links to the documents once they're published (the user decides where). */
  status: "run" as "pending" | "run" | "published",
  version: "1.8 (release branch)",
  date: "2026-10-13" as string | null,
  org: "Roritor Health, Inc.",
  topicCount: 25,
  repoUrl: null as string | null,
  confluenceUrl: null as string | null,

  /**
   * In the order the user listed them. Every hosted model runs through
   * OpenRouter, and `id` is the id the run used, as its ledger records it.
   * Gemini's is a preview id: re-check it is still listed before publishing.
   */
  models: [
    {
      key: "local", label: "Local · Qwen3 14B", id: "qwen3:14b-pf32", where: "Your own machine",
      costUsd: 0, costSource: null, topicUsd: 0, minutes: 130, topicsDone: 22,
      docs: { standards: 22, procedures: 22, policies: 10 },
      outcome: "Three AI topics’ Standards failed the AI RMF Playbook check (NIST’s suggested actions weren’t written as NIST’s), so they and the AI Governance Policy over them weren’t written.",
    },
    {
      key: "opus", label: "Claude Opus 5.5", id: "anthropic/claude-opus-5.5", where: HOSTED,
      costUsd: 34.002, costSource: "billed", topicUsd: 1.5759, minutes: 92, topicsDone: 24,
      docs: { standards: 24, procedures: 24, policies: 10 },
      outcome: "Its AI Risk Treatment & Incident Response Standard failed the AI RMF Playbook check, so that topic and the AI Governance Policy over it weren’t written.",
    },
    {
      key: "gpt", label: "GPT-6 Sol", id: "openai/gpt-6-sol", where: HOSTED,
      costUsd: 6.0536, costSource: "billed", topicUsd: 0.2677, minutes: 48, topicsDone: 25,
      docs: { standards: 25, procedures: 25, policies: 11 },
    },
  ] satisfies Model[],

  /** One requirement, as each model's Standard wrote it. */
  comparison: {
    topic: "Incident Response",
    section: "Incident response training: who is trained, and when",
    /** Keyed by `models[].key`; a model with an excerpt file needs no entry here. */
    drafts: [] as Draft[],
  },

  /** One topic's document set, top to bottom. */
  tree: {
    topic: "Backup, Restore & Contingency",
    policy: "Continuity",
    docs: [
      { tier: "Policy", says: "What the organization commits to, and who is accountable." },
      { tier: "Standard", says: "The measurable requirements, each citing the controls it meets." },
      { tier: "Procedure", says: "The steps a named team follows to meet the Standard." },
    ],
  },

  /** The ask-Zardoz demo: real questions, with real answers over these documents. */
  demo: [
    {
      question: "How long do we retain media protection documentation?",
      shows: "A cited answer",
      kind: "answer",
      answer:
        "IT Asset Management must retain media-protection documentation for six years from creation or last effective date, whichever is later. [1]",
      cites: ["Media Handling & Disposal Standard § 4.2"],
      standIn: true,
    },
    {
      question: "Who owns that?",
      shows: "A follow-up question",
      kind: "answer",
      note: "Reading that as: who owns media-protection documentation retention?",
      answer: null,
      cites: [],
    },
    {
      question: "What does AC-2(3) require?",
      shows: "An exact control, not a near match",
      kind: "answer",
      answer: null,
      cites: [],
    },
    {
      question: "How often do we check who has admin?",
      shows: "Plain words, matched to the documents' vocabulary",
      kind: "answer",
      note: "Nothing matched those words; searched also for: privileged access, entitlements, recertification.",
      answer: null,
      cites: [],
      standIn: true,
    },
    {
      question: "What is our vacation policy?",
      shows: "Saying no",
      kind: "refusal",
      answer: "Nothing in the synced documents appears to bear on that.",
      cites: [],
      standIn: true,
    },
    {
      question: "Which controls does nobody own?",
      shows: "A report about the program, printed as is",
      kind: "report",
      answer: null,
      cites: [],
    },
  ] satisfies Turn[],
};

export const modelByKey = Object.fromEntries(examples.models.map((m) => [m.key, m]));

/** One entry per model, in lineup order; the page finds each excerpt file by `model`. */
export const comparisonDrafts: Draft[] = examples.models.map(
  (m) => examples.comparison.drafts.find((d) => d.model === m.key) ?? { model: m.key, path: null },
);

/** The cost table's rows: cheapest first, a model with no figure yet last; lineup order breaks ties. */
export const byCost: Model[] = [...examples.models].sort((a, b) => {
  if (a.costUsd === null || b.costUsd === null) return (a.costUsd === null ? 1 : 0) - (b.costUsd === null ? 1 : 0);
  return a.costUsd - b.costUsd;
});

const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const inWords = (n: number) => WORDS[n] ?? String(n);

/** Counts for the page's prose, taken from the lineup so a sentence can't disagree with the table. */
export const modelCount = inWords(examples.models.length);
export const hostedCount = inWords(examples.models.filter((m) => m.where !== "Your own machine").length);
export const localCount = inWords(examples.models.filter((m) => m.where === "Your own machine").length);
export const topicWords = inWords(examples.topicCount);

/** The label every excerpt carries. */
export function stamp(model: Model): string {
  const when = examples.date ?? "date of run";
  return `Example output, generated by ${model.id} with PolicyForge ${examples.version} on ${when}. ${examples.org} and its teams are fictional. Not legal or compliance advice.`;
}
