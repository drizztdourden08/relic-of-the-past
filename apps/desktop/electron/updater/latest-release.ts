/* @layer electron-main @kind logic */
import type { UpdateInfo } from './updater.type';
import { compareVersions } from './version-compare';
import { targetCompatFor } from './target-format';
import { RELEASES_URL } from './latest-release.constants';
import type { GithubRelease } from './latest-release.type';

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
    saveStates: targetCompatFor(newest.version, newest.release.assets),
  };
};

export { findNewerRelease };
