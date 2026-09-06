/* @layer electron-main @kind constants */

const FEED_OWNER = 'drizztdourden08';
const FEED_REPO = 'relic-of-the-past';
const FEED_REPO_URL = `https://github.com/${FEED_OWNER}/${FEED_REPO}`;

/**
 * Where the release list is read from. Overridable so the whole update path can be
 * pointed at a local fixture server. Unset in every shipped build.
 */
const API_ORIGIN = process.env.ROTP_UPDATE_API_ORIGIN || 'https://api.github.com';

const releasesUrl = (perPage: number): string =>
  `${API_ORIGIN}/repos/${FEED_OWNER}/${FEED_REPO}/releases?per_page=${perPage}`;

/** Releases are tagged `v<version>`, which is how a feed entry finds its release. */
const releaseTagFor = (version: string): string => `v${version}`;

/** Delay before the first check, so startup work is not competing with it. */
const FIRST_CHECK_DELAY_MS = 5000;

/**
 * The release index Velopack writes next to each release. The channel suffix is the
 * platform name (no build passes `--channel`), so one file lists every version.
 */
const FEED_FILE = 'releases.win.json';

/**
 * How many deltas Velopack chains before pulling the whole package. Shared with the
 * size shown in the picker, or the dialog promises 80 KB and fetches 137 MB.
 */
const MAX_DELTAS = 10;

export {
  API_ORIGIN, FEED_FILE, FEED_OWNER, FEED_REPO, FEED_REPO_URL,
  FIRST_CHECK_DELAY_MS, MAX_DELTAS, releasesUrl, releaseTagFor,
};
