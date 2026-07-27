/* @layer electron-main @kind logic */
// Public endpoint of the anonymous, rate-limited GCP relay (project rotp-bugreports).
// Not a secret — no different from the api.github.com URL already in updater/index.ts.
const REPORT_ISSUE_URL = 'https://us-central1-rotp-bugreports.cloudfunctions.net/reportIssue';

export { REPORT_ISSUE_URL };
