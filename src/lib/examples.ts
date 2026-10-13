/**
 * The /examples page's content: PolicyForge run for real on public-framework
 * topics with seven models (PolicyForge issue 286; the lineup is the user's,
 * recorded on 286 as comment 6468).
 *
 * Every value here comes from a published run, copied verbatim: the document
 * text, the ledger's cost and time, and the Zardoz transcripts. Nothing is
 * written by hand. Until the runs exist, `status` is "pending", the values
 * are null, and the page says so instead of showing anything that looks like
 * output.
 *
 * `standIn` marks a demo answer copied from the PolicyForge docs, which
 * answers over a different document set. Those are layout stand-ins for the
 * preview only and must all be replaced before the page goes live.
 */

export type Model = {
  key: string;
  label: string;
  id: string;
  where: string;
  /** From the run's ledger, as it reports it; null until the run exists. */
  costUsd: number | null;
  costSource: "billed" | "estimated" | null;
  minutes: number | null;
  documents: number | null;
  /** Deontic and citation warnings across the set, from the run's checks. */
  warnings: number | null;
};

export type Draft = { model: string; text: string | null; path: string | null };

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

/** A model in the lineup, with no figures until its run exists. */
function run(key: string, label: string, id: string, where: string): Model {
  return { key, label, id, where, costUsd: null, costSource: null, minutes: null, documents: null, warnings: null };
}

export const examples = {
  status: "pending" as "pending" | "published",
  version: "1.8.0",
  date: null as string | null,
  repoUrl: null as string | null,
  confluenceUrl: null as string | null,

  /**
   * In the order the user listed them. Every hosted model runs through
   * OpenRouter, and `id` is the id the run used, as its ledger records it.
   * Gemini's is a preview id: re-check it is still listed before publishing.
   */
  models: [
    run("local", "Local · Qwen3 14B", "qwen3:14b-pf32", "Your own machine"),
    run("glm", "GLM 5.3", "z-ai/glm-5.3", HOSTED),
    run("opus", "Claude Opus 5.5", "anthropic/claude-opus-5.5", HOSTED),
    run("gpt", "GPT-6 Sol", "openai/gpt-6-sol", HOSTED),
    run("gemini", "Gemini 3.1 Pro (preview)", "google/gemini-3.1-pro-preview", HOSTED),
    run("deepseek", "DeepSeek V4 Pro", "deepseek/deepseek-v4-pro-0813", HOSTED),
    run("llama", "Llama 3.2 1B", "meta-llama/llama-3.2-1b-instruct", HOSTED),
  ] satisfies Model[],

  /** One requirement, as each model's Standard wrote it. */
  comparison: {
    topic: "Account Management",
    section: "Account recertification",
    controls: ["NIST 800-53 AC-2(j)", "HIPAA 164.308(a)(4)"],
    /** One per model, keyed by `models[].key`; the page lists them in that order. */
    drafts: [] as Draft[],
  },

  /** One topic's document set, top to bottom. */
  tree: {
    topic: "Account Management",
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

/** Each model's paragraph, in lineup order; a model with no draft yet gets an empty one. */
export const comparisonDrafts: Draft[] = examples.models.map(
  (m) => examples.comparison.drafts.find((d) => d.model === m.key) ?? { model: m.key, text: null, path: null },
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

/** The label every excerpt carries. */
export function stamp(model: Model): string {
  const when = examples.date ?? "date of run";
  return `Example output, generated by ${model.id} with PolicyForge ${examples.version} on ${when}. Not legal or compliance advice.`;
}
