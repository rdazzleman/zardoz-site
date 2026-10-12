/** Site-wide settings. Change the contact address here and it changes everywhere. */
export const site = {
  name: "Zardoz",
  contactEmail: "info@zardoz.io",
  contactHref: "mailto:info@zardoz.io?subject=Zardoz",
  /** The licensed-framework plugin (HITRUST, GovRAMP, SOC 2 readers) is had by asking. */
  pluginHref: "mailto:info@zardoz.io?subject=PolicyForge%20licensed-framework%20plugin",
  github: "https://github.com/rdazzleman/policyforge",
  /** The release the /trust and /compare pages describe: their code links open the repo at this tag. */
  releaseTag: "v1.8.0",
};

export const nav = [
  { href: "/how-it-works", label: "How it works" },
  // "Examples" returns with src/pages/_examples.astro once 286's real runs exist and the
  // user approves the page; it is out of the 1.8 build so placeholders never go live.
  { href: "/frameworks", label: "Frameworks" },
  { href: "/models", label: "Models & cost" },
  { href: "/quickstart", label: "Quick start" },
  { href: "/docs", label: "Docs" },
];
