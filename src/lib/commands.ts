/**
 * Every `policyforge` command in 1.7.0, by pipeline stage. "How it works" shows each
 * stage's key commands; /docs/commands lists them all. One list, so they can't drift.
 */
export const stages: { title: string; summary: string; key: string[]; cmds: [string, string][] }[] = [
  {
    title: "Set up",
    key: ["init", "llm-check"],
    summary: "Create a project and confirm your AI connection works. Nothing here spends money except one small test call.",
    cmds: [
      ["init", "Create a project folder with the included frameworks and example settings."],
      ["llm-check", "Confirm your API key and model work, and show what the provider supports."],
      ["frameworks", "List the frameworks on disk and whether each may be shared."],
      ["boundary", "Show which content may be sent to your configured AI model, and why."],
      ["roles", "List the tools and teams your settings can name, like your identity provider."],
    ],
  },
  {
    title: "Load frameworks",
    key: ["etl-oscal", "generate-parser"],
    summary: "Turn each published framework into the same structured format. Public ones are fetched from the publisher; licensed ones are read from an export you provide.",
    cmds: [
      ["etl-oscal", "Fetch NIST 800-53 Rev 5 from NIST's official source, with its Low, Moderate and High baselines."],
      ["etl-800-171", "Fetch NIST 800-171 Rev 3 from NIST's official source."],
      ["etl-ai-rmf", "Fetch the NIST AI Risk Management Framework 1.0."],
      ["etl-ai-rmf-playbook", "Fetch NIST's AI RMF Playbook — its suggested actions for each subcategory."],
      ["etl-onc", "Fetch the ONC health IT certification criteria (45 CFR 170.315) from the official eCFR."],
      ["etl-hipaa", "Fetch the HIPAA Security Rule from the official eCFR."],
      ["etl-hipaa-crosswalk", "Attach NIST's official map between HIPAA and 800-53."],
      ["etl-hipaa-privacy", "Fetch the HIPAA Privacy and Breach Notification Rules from the official eCFR, with the paragraphs a court vacated marked."],
      ["etl-csf", "Fetch NIST CSF 2.0 from NIST's official source, with NIST's own map to 800-53."],
      ["etl-fedramp", "Fetch FedRAMP's published tailoring and apply it to 800-53."],
      ["etl-arc-ampe", "Fetch the CMS ARC-AMPE baseline."],
      ["etl-info-blocking", "Fetch the federal information blocking rules (45 CFR Part 171)."],
      ["etl-part2", "Fetch the security sections of the substance use disorder records rule (42 CFR Part 2)."],
      ["etl-hitrust", "Read your own licensed HITRUST CSF export. Needs the licensed-framework plugin; contact us for it."],
      ["etl-govramp", "Read your own GovRAMP controls matrix. Needs the licensed-framework plugin; contact us for it."],
      ["etl-soc2-tsc", "Read your own copy of the AICPA's SOC 2 Trust Services Criteria. Needs the licensed-framework plugin; contact us for it."],
      ["etl-vault", "Read Markdown notes in one specific shape (frontmatter, headings and wikilinks), the format this project started from."],
      ["generate-parser", "Draft a reader for a framework format that isn't supported yet, from a sample file."],
    ],
  },
  {
    title: "Map them together",
    key: ["map", "coverage"],
    summary: "Cross-reference the control frameworks onto NIST 800-53, so a requirement stated several ways is treated as one. This step uses no AI and costs nothing.",
    cmds: [
      ["map", "Build the cross-framework map."],
      ["crosswalk", "Keep your organization's own reviewed mapping for a framework."],
      ["coverage", "Show in-scope controls no topic owns yet, and controls two topics both claim."],
      ["drift", "When a framework is updated, show what changed and which documents it affects."],
    ],
  },
  {
    title: "Draft documents",
    key: ["synthesize", "generate", "parameters"],
    summary: "This is where AI is used. For each topic, every relevant requirement is merged into one list, then written up as three documents. The AI works only from the text it is given.",
    cmds: [
      ["synthesize", "Merge every requirement a topic owns into one de-duplicated list."],
      ["generate", "Write a Policy, Standard or Procedure from that list."],
      ["parameters", "Record your decided values, like a review frequency, so regenerated documents use them."],
      ["ssp", "Build a NIST 800-53 System Security Plan as a spreadsheet."],
    ],
  },
  {
    title: "Check and publish",
    key: ["check", "publish", "history"],
    summary: "Checks run before anything goes live, and nothing is published without you explicitly asking. You can also pull edits back from the wiki and compare.",
    cmds: [
      ["check", "Check documents for problems before publishing."],
      ["publish", "Publish documents to the pages they're set up for."],
      ["export-confluence", "Convert one document for Confluence and publish it."],
      ["import-confluence", "Pull a page back out of Confluence into version history."],
      ["pull", "Bring live Confluence pages down as files."],
      ["wiki-drift", "Show which published pages were changed on the wiki since they were written."],
      ["edit-confluence", "Edit one live page from a plain-English instruction."],
      ["edit-topic", "Apply one instruction across all of a topic's documents."],
      ["history", "List or compare the saved versions of a document."],
    ],
  },
  {
    title: "Ask questions",
    key: ["zardoz", "addresses", "satisfies"],
    summary: "Once documents exist, most questions are follow-ups: who owns this, how often, does it cover that. This is the part called Zardoz.",
    cmds: [
      ["zardoz", "Ask questions about your published policies in plain English."],
      ["addresses", "Who answers for a requirement, and which document says so."],
      ["satisfies", "Which requirements a published document can be shown to meet, and how strong that evidence is."],
      ["bundle", "Everything one team is responsible for, in one view."],
      ["model-log", "What was sent to which AI model, when, and what it cost."],
      ["mcp", "Let an AI assistant such as Claude use these read-only lookups directly."],
    ],
  },
];
