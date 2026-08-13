/* @layer electron-main @kind constants */

const FEED_OWNER = 'drizztdourden08';
const FEED_REPO = 'relic-of-the-past';
const FEED_REPO_URL = `https://github.com/${FEED_OWNER}/${FEED_REPO}`;

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

export { FEED_FILE, FEED_OWNER, FEED_REPO, FEED_REPO_URL, FIRST_CHECK_DELAY_MS, releaseTagFor };
