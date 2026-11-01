/* @layer website-site @kind constants */
const REPO = 'drizztdourden08/relic-of-the-past';
const REPO_HOME_URL = `https://github.com/${REPO}`;
const RELEASES_PAGE_URL = `${REPO_HOME_URL}/releases`;
const REPO_API_URL = `https://api.github.com/repos/${REPO}`;
const LATEST_RELEASE_URL = `${REPO_API_URL}/releases/latest`;
const CONTRIBUTORS_URL = `${REPO_API_URL}/contributors?per_page=12`;

export { CONTRIBUTORS_URL, LATEST_RELEASE_URL, RELEASES_PAGE_URL, REPO_API_URL, REPO_HOME_URL };
