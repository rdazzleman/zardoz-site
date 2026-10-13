/**
 * The /examples page's content: PolicyForge run for real on public-framework
 * topics with seven models (PolicyForge issue 286; the lineup is the user's,
 * recorded on 286 as comment 6468).
 *
 * The run: six topics, the fictional Roritor Health profile, release/1.8 at
 * 0cce41e3, 2026-10-13, by b5 (286 comments 6596 and 6597). Its tree is
 * C:\policyforge-local\example-output\roritor-1.8\ on the team's machine.
 *
 * Every figure is copied from that run, never written by hand: a model's cost
 * is its ledger total (`run_usd_ledger` in its run.json), the topic cost is
 * the sum of that topic's step costs, the time is the sum of its steps'
 * seconds, and the document counts are the files in its standards/,
 * procedures/ and policies/. Costs are what OpenRouter billed, one sample each
 * at the engine's default effort (80's ruling, 286 comment 6600). DeepSeek's is
 * a floor: the pass was billed $0.86 that no ledger row holds.
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
  /** Of the run's six topics, how many got both a Standard and a Procedure. */
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
  version: "1.8 (release branch, 0cce41e3)",
  date: "2026-10-13" as string | null,
  org: "Roritor Health, Inc.",
  topicCount: 6,
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
      costUsd: 0, costSource: null, topicUsd: 0, minutes: 24, topicsDone: 6,
      docs: { standards: 6, procedures: 6, policies: 2 },
    },
    {
      key: "glm", label: "GLM 5.3", id: "z-ai/glm-5.3", where: HOSTED,
      costUsd: 1.9314, costSource: "billed", topicUsd: 0.1972, minutes: 52, topicsDone: 6,
      docs: { standards: 6, procedures: 6, policies: 2 },
    },
    {
      key: "opus", label: "Claude Opus 5.5", id: "anthropic/claude-opus-5.5", where: HOSTED,
      costUsd: 10.362, costSource: "billed", topicUsd: 2.1845, minutes: 64, topicsDone: 5,
      docs: { standards: 5, procedures: 5, policies: 2 },
      outcome: "One topic's merged requirements ran past the 32,768-token reply budget and were cut off, so nothing was written for Identity Lifecycle & Access Review.",
    },
    {
      key: "gpt", label: "GPT-6 Sol", id: "openai/gpt-6-sol", where: HOSTED,
      costUsd: 1.6056, costSource: "billed", topicUsd: 0.29, minutes: 26, topicsDone: 6,
      docs: { standards: 6, procedures: 6, policies: 2 },
    },
    {
      key: "gemini", label: "Gemini 3.1 Pro (preview)", id: "google/gemini-3.1-pro-preview", where: HOSTED,
      costUsd: 3.5695, costSource: "billed", topicUsd: 0.5422, minutes: 42, topicsDone: 6,
      docs: { standards: 6, procedures: 6, policies: 2 },
    },
    {
      key: "deepseek", label: "DeepSeek V4 Pro", id: "deepseek/deepseek-v4-pro-0813", where: HOSTED,
      costUsd: 2.3832, costSource: "billed", floor: true, topicUsd: 0.5697, minutes: 131, topicsDone: 2,
      docs: { standards: 2, procedures: 2, policies: 0 },
      outcome: "Finished 2 of 6 topics at the default settings: on the other four, its reasoning used the whole reply budget and returned no text.",
    },
    {
      key: "llama", label: "Llama 3.2 1B", id: "meta-llama/llama-3.2-1b-instruct", where: HOSTED,
      costUsd: 0.0203, costSource: "billed", topicUsd: 0.0004, minutes: 29, topicsDone: 0,
      docs: { standards: 5, procedures: 0, policies: 0 },
      outcome: "Wrote five Standards with no title, so no Procedure could be drafted from them; its sixth failed the AI RMF Playbook check.",
    },
  ] satisfies Model[],

  /** One requirement, as each model's Standard wrote it. */
  comparison: {
    topic: "Incident Response",
    section: "Incident response training: who is trained, and when",
    /** Keyed by `models[].key`; a model with an excerpt file needs no entry here. */
    drafts: [
      {
        model: "llama",
        path: null,
        note: "Its Standard has no requirements to compare: below its title is a single heading of “1.1.1.1…”, 19,598 characters long.",
      },
    ] as Draft[],
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
