/* @layer electron-main @kind logic */
/**
 * The newest published version, read straight from the release page.
 *
 * This is the check for platforms that cannot install an update themselves. It needs
 * nothing but the release list, so it works wherever the app runs, and it is the same
 * question the in-app updater asks: is there something newer than this build?
 */
import { FEED_OWNER, FEED_REPO } from './updater.constants';
import type { UpdateInfo } from './updater.type';
import { compareVersions } from './version-feed';

const RELEASES_URL = `https://api.github.com/repos/${FEED_OWNER}/${FEED_REPO}/releases?per_page=20`;

interface GithubRelease {
  tag_name: string;
  body?: string;
  draft: boolean;
  prerelease: boolean;
  published_at?: string;
}

/** The newest release, or null when nothing is newer than what is running. */
const findNewerRelease = async (currentVersion: string, allowPrerelease: boolean): Promise<UpdateInfo | null> => {
  const res = await fetch(RELEASES_URL, { headers: { Accept: 'application/vnd.github.v3+json' } });
  if (!res.ok) throw new Error(`Could not read the release list (${res.status})`);

  const releases = (await res.json() as GithubRelease[])
    .filter((r) => !r.draft && (allowPrerelease || !r.prerelease));

  const newest = releases
    .map((r) => ({ release: r, version: r.tag_name.replace(/^v/, '') }))
    .sort((a, b) => compareVersions(b.version, a.version))[0];

  if (!newest || compareVersions(newest.version, currentVersion) <= 0) return null;

  return {
    version: newest.version,
    releaseNotes: newest.release.body ?? '',
    releaseDate: newest.release.published_at ?? '',
  };
};

/** Where someone is sent when the app cannot install the update for them. */
const releasePageUrl = (version?: string): string => {
  const base = `https://github.com/${FEED_OWNER}/${FEED_REPO}/releases`;
  return version ? `${base}/tag/v${version}` : `${base}/latest`;
};

export { findNewerRelease, releasePageUrl };
