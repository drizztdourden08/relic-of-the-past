/* @layer electron-main @kind logic */
/**
 * Every installable version, for the picker.
 *
 * Velopack's own check only ever reports the newest applicable release, so the list
 * comes from the release index it publishes beside each release. That index carries
 * the checksums, which is why the picker cannot be built from the GitHub API alone:
 * an entry without its hash fails verification at install time.
 *
 * The release page supplies what the index does not, namely which tags are marked
 * pre-release and when each was published.
 */
import type { VelopackAsset } from 'velopack';
import { FEED_FILE, FEED_OWNER, FEED_REPO, MAX_DELTAS } from './updater.constants';
import type { VersionCandidate } from './updater.type';

interface GithubAsset {
  name: string;
  browser_download_url: string;
}

interface GithubRelease {
  tag_name: string;
  body?: string;
  draft: boolean;
  prerelease: boolean;
  published_at?: string;
  assets?: GithubAsset[];
}

const RELEASES_URL = `https://api.github.com/repos/${FEED_OWNER}/${FEED_REPO}/releases?per_page=30`;

const readReleases = async (): Promise<GithubRelease[]> => {
  const res = await fetch(RELEASES_URL, { headers: { Accept: 'application/vnd.github.v3+json' } });
  if (!res.ok) throw new Error(`Could not read the release list (${res.status})`);
  return (await res.json()) as GithubRelease[];
};

/**
 * The index is a JSON document listing assets. Both an object with an `Assets` array
 * and a bare array are accepted, so a format change does not take the picker with it.
 */
const parseFeed = (raw: unknown): VelopackAsset[] => {
  const list = Array.isArray(raw) ? raw : (raw as { Assets?: unknown })?.Assets;
  if (!Array.isArray(list)) return [];
  return list.filter((entry): entry is VelopackAsset => {
    const asset = entry as Partial<VelopackAsset>;
    return typeof asset?.Version === 'string' && typeof asset?.FileName === 'string';
  });
};

/** Numeric compare on x.y.z; a build with a pre-release suffix sorts below a plain one. */
const compareVersions = (a: string, b: string): number => {
  const parts = (v: string) => v.split('-')[0].split('.').map((n) => parseInt(n, 10) || 0);
  const [pa, pb] = [parts(a), parts(b)];
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  const tag = (v: string) => (v.includes('-') ? 0 : 1);
  return tag(a) - tag(b);
};

/**
 * What installing `target` from `current` actually pulls down.
 *
 * Moving forward, Velopack applies one delta per version in between, so the download
 * is their sum and not the size of anything listed against the target: a 137 MB
 * package can be an 80 KB hop. It falls back to the full package when any step in the
 * chain has no delta published, or when the chain is longer than it will chain
 * (MaximumDeltasBeforeFallback, set where the manager is built).
 *
 * Going back, or reinstalling what is already there, is always the full package.
 */
const downloadSizeFor = (
  target: string,
  current: string,
  full: Map<string, number>,
  delta: Map<string, number>,
  maxDeltas: number,
): number => {
  const fullSize = full.get(target) ?? 0;
  if (compareVersions(target, current) <= 0) return fullSize;

  const hops = [...full.keys()]
    .filter((v) => compareVersions(v, current) > 0 && compareVersions(v, target) <= 0)
    .sort(compareVersions);
  if (!hops.length || hops.length > maxDeltas) return fullSize;
  if (hops.some((v) => !delta.has(v))) return fullSize;

  return hops.reduce((sum, v) => sum + (delta.get(v) ?? 0), 0);
};

/** Newest first, which is the order the picker shows them in. */
const listVersions = async (currentVersion: string, allowPrerelease: boolean): Promise<VersionCandidate[]> => {
  const releases = (await readReleases()).filter((r) => !r.draft && (allowPrerelease || !r.prerelease));
  const byVersion = new Map(releases.map((r) => [r.tag_name.replace(/^v/, ''), r]));

  // The newest index lists every release Velopack knew about when it was packed, so
  // one fetch covers the whole history.
  const withFeed = releases.find((r) => r.assets?.some((a) => a.name === FEED_FILE));
  const feedUrl = withFeed?.assets?.find((a) => a.name === FEED_FILE)?.browser_download_url;
  if (!feedUrl) return [];

  const res = await fetch(feedUrl);
  if (!res.ok) throw new Error(`Could not read the release index (${res.status})`);
  const assets = parseFeed(await res.json());

  // Both tables are needed before any row can be sized: a delta chain is only known
  // once every version between here and there has been seen.
  const isDelta = (asset: VelopackAsset) => asset.Type?.toLowerCase() === 'delta';
  const fullSizes = new Map<string, number>();
  const deltaSizes = new Map<string, number>();
  for (const asset of assets) {
    if (!byVersion.has(asset.Version)) continue;
    (isDelta(asset) ? deltaSizes : fullSizes).set(asset.Version, asset.Size ?? 0);
  }

  const options = assets
    .filter((asset) => !isDelta(asset))
    .filter((asset) => byVersion.has(asset.Version))
    .map((asset) => {
      const release = byVersion.get(asset.Version)!;
      const order = compareVersions(asset.Version, currentVersion);
      return {
        version: asset.Version,
        releaseNotes: asset.NotesMarkdown || release.body || '',
        releaseDate: release.published_at ?? '',
        size: asset.Size ?? 0,
        downloadSize: downloadSizeFor(asset.Version, currentVersion, fullSizes, deltaSizes, MAX_DELTAS),
        prerelease: release.prerelease,
        downgrade: order < 0,
        installed: order === 0,
        asset,
      } satisfies VersionCandidate;
    });

  return options.sort((a, b) => compareVersions(b.version, a.version));
};

export { compareVersions, listVersions };
