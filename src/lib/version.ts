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
const FALLBACK = "v1.7.0";

const API = "https://api.github.com/repos/rdazzleman/policyforge";
const HEADERS = { Accept: "application/vnd.github+json", "User-Agent": "zardoz-io-site" };
const SEMVER = /^v(\d+)\.(\d+)\.(\d+)$/;

/** The newest vX.Y.Z tag, by version number rather than by API order. */
function newest(tags: string[]): string | undefined {
  const parsed = tags
    .map((t) => [t, SEMVER.exec(t)] as const)
    .filter((x): x is readonly [string, RegExpExecArray] => x[1] !== null)
    .map(([t, m]) => [t, Number(m[1]), Number(m[2]), Number(m[3])] as const);
  parsed.sort((a, b) => b[1] - a[1] || b[2] - a[2] || b[3] - a[3]);
  return parsed[0]?.[0];
}

/**
 * A GitHub Release if there is one, else the newest version tag. The public
 * repository can carry tags without Release objects (1.7.0 was pushed as a tag
 * only), and the pipx line installs from a tag, so a tag is what has to exist.
 */
export async function latestVersion(): Promise<string> {
  try {
    const rel = await fetch(`${API}/releases/latest`, { headers: HEADERS });
    if (rel.ok) {
      const body = (await rel.json()) as { tag_name?: unknown };
      if (typeof body.tag_name === "string" && SEMVER.test(body.tag_name)) return body.tag_name;
    }
    const res = await fetch(`${API}/tags?per_page=100`, { headers: HEADERS });
    if (!res.ok) return FALLBACK;
    const tags = ((await res.json()) as { name?: unknown }[])
      .map((t) => t.name)
      .filter((n): n is string => typeof n === "string");
    return newest(tags) ?? FALLBACK;
  } catch {
    return FALLBACK;
  }
}
