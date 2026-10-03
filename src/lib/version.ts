/**
 * The PolicyForge version the site tells people to install.
 *
 * Resolved from GitHub at build time rather than typed into a page, because a
 * hardcoded install pin goes stale silently and the first command a new user
 * copies is the worst place for that. The README carried a three-release-old
 * pin for exactly this reason.
 *
 * FALLBACK is only reached when the API is unreachable or rate-limited
 * (unauthenticated GitHub allows 60 requests/hour per IP, and Actions runners
 * share addresses). Keep it current-ish, but it is a safety net, not the source.
 */
const FALLBACK = "v1.6.1";

export async function latestVersion(): Promise<string> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/rdazzleman/policyforge/releases/latest",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "zardoz-io-site",
        },
      },
    );
    if (!res.ok) return FALLBACK;
    const body = (await res.json()) as { tag_name?: unknown };
    return typeof body.tag_name === "string" && /^v\d/.test(body.tag_name)
      ? body.tag_name
      : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
