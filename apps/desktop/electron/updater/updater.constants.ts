/* @layer electron-main @kind constants */

const FEED_OWNER = 'drizztdourden08';
const FEED_REPO = 'relic-of-the-past';
const FEED_REPO_URL = `https://github.com/${FEED_OWNER}/${FEED_REPO}`;

/**
 * Where the release list is read from. Overridable so the whole update path — fetch,
 * parse, compare, warn — can be pointed at a local fixture server and exercised without
 * publishing anything. Unset in every shipped build.
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
 * platform name unless a build passed `--channel`, and everything here uses the
 * default, so a single file lists every installable version.
 */
const FEED_FILE = 'releases.win.json';

/**
 * How many deltas Velopack will chain before it gives up and pulls the whole package.
 * Shared with the size shown in the picker: if these two disagree, the dialog promises
 * an 80 KB download and then fetches 137 MB.
 */
const MAX_DELTAS = 10;

export {
  API_ORIGIN, FEED_FILE, FEED_OWNER, FEED_REPO, FEED_REPO_URL,
  FIRST_CHECK_DELAY_MS, MAX_DELTAS, releasesUrl, releaseTagFor,
};
