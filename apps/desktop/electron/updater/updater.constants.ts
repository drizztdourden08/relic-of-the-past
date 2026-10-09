/* @layer electron-main @kind constants */
const FEED_OWNER = 'drizztdourden08';
const FEED_REPO = 'relic-of-the-past';
const FEED_REPO_URL = `https://github.com/${FEED_OWNER}/${FEED_REPO}`;

const API_ORIGIN = process.env.ROTP_UPDATE_API_ORIGIN || 'https://api.github.com';

const FIRST_CHECK_DELAY_MS = 5000;

const FEED_FILE = 'releases.win.json';

const MAX_DELTAS = 10;

export {
  API_ORIGIN, FEED_FILE, FEED_OWNER, FEED_REPO, FEED_REPO_URL,
  FIRST_CHECK_DELAY_MS, MAX_DELTAS,
};
