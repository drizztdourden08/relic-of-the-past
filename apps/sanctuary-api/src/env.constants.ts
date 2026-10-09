/* @layer root-config @kind constants */
const REQUIRED_SANCTUARY_ENV = [
  'SANCTUARY_ORIGIN',
  'GITHUB_ISSUE_TOKEN',
  'B2_KEY_ID', 'B2_APP_KEY', 'B2_BUCKET', 'B2_ENDPOINT', 'B2_REGION',
] as const;

export { REQUIRED_SANCTUARY_ENV };
