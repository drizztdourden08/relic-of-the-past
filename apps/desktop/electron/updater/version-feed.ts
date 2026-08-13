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
 * How to get from `current` to `target`, in the shape Velopack asks for.
 *
 * Velopack's own model is a walk: a base full release plus the ordered deltas that
 * carry it to the target. `UpdateInfo.DeltasToTarget` is documented as exactly that,
 * and `downloadUpdateAsync` unpacks them, falling back to the full package by itself
 * if preparing any of them fails.
 *
 * This is deliberately the ONE place that decision is made. The size in the picker and
 * the bytes the download actually fetches both come from this plan, because computing
 * them separately is how the dialog ended up promising 80 KB while the code fetched a
 * full package.
 *
 * Deltas are dropped, leaving a plain full install, when:
 *  - the target is not newer (a downgrade or a reinstall, where Velopack's own docs say
 *    only full updates are allowed),
 *  - the installed version is not in the feed, so there is no base to walk from,
 *  - any version in between has no delta published,
 *  - the chain is longer than Velopack will chain (MaximumDeltasBeforeFallback).
 */
interface UpdatePlan {
  target: VelopackAsset;
  base?: VelopackAsset;
  deltas: VelopackAsset[];
  /** What this plan downloads: the deltas it will walk, or the whole package. */
  downloadSize: number;
}

const planFor = (
  target: string,
  current: string,
  full: Map<string, VelopackAsset>,
  delta: Map<string, VelopackAsset>,
  maxDeltas: number,
): UpdatePlan => {
  const targetAsset = full.get(target)!;
  const fullOnly: UpdatePlan = { target: targetAsset, deltas: [], downloadSize: targetAsset.Size ?? 0 };
  if (compareVersions(target, current) <= 0) return fullOnly;

  const base = full.get(current);
  if (!base) return fullOnly;

  const hops = [...full.keys()]
    .filter((v) => compareVersions(v, current) > 0 && compareVersions(v, target) <= 0)
    .sort(compareVersions);
  if (!hops.length || hops.length > maxDeltas) return fullOnly;
  if (hops.some((v) => !delta.has(v))) return fullOnly;

  const deltas = hops.map((v) => delta.get(v)!);
  return {
    target: targetAsset,
    base,
    deltas,
    downloadSize: deltas.reduce((sum, d) => sum + (d.Size ?? 0), 0),
  };
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

  // Both tables are needed before any row can be planned: a chain is only known once
  // every version between here and there has been seen.
  const isDelta = (asset: VelopackAsset) => asset.Type?.toLowerCase() === 'delta';
  const fullAssets = new Map<string, VelopackAsset>();
  const deltaAssets = new Map<string, VelopackAsset>();
  for (const asset of assets) {
    if (!byVersion.has(asset.Version)) continue;
    (isDelta(asset) ? deltaAssets : fullAssets).set(asset.Version, asset);
  }

  const options = [...fullAssets.values()]
    .map((asset) => {
      const release = byVersion.get(asset.Version)!;
      const order = compareVersions(asset.Version, currentVersion);
      const plan = planFor(asset.Version, currentVersion, fullAssets, deltaAssets, MAX_DELTAS);
      return {
        version: asset.Version,
        releaseNotes: asset.NotesMarkdown || release.body || '',
        releaseDate: release.published_at ?? '',
        size: asset.Size ?? 0,
        downloadSize: plan.downloadSize,
        prerelease: release.prerelease,
        downgrade: order < 0,
        installed: order === 0,
        plan,
      } satisfies VersionCandidate;
    });

  return options.sort((a, b) => compareVersions(b.version, a.version));
};

export { compareVersions, listVersions };
export type { UpdatePlan };
