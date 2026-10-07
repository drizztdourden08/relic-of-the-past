/* @layer root-config @kind logic */
/** Typed view of the Sanctuary's own settings: its origin, the issue token and its bucket.
 *  The account settings every site shares are read by hub-core. Read lazily so a build or
 *  typecheck never needs the deploy environment. */
import { readRequired } from '../../hub-core/env';

type SanctuaryEnv = {
  SANCTUARY_ORIGIN: string;
  GITHUB_ISSUE_TOKEN: string;
  B2_KEY_ID: string;
  B2_APP_KEY: string;
  B2_BUCKET: string;
  B2_ENDPOINT: string;
  B2_REGION: string;
};

const REQUIRED = [
  'SANCTUARY_ORIGIN',
  'GITHUB_ISSUE_TOKEN',
  'B2_KEY_ID', 'B2_APP_KEY', 'B2_BUCKET', 'B2_ENDPOINT', 'B2_REGION',
] as const;

let cached: SanctuaryEnv | null = null;

const readSanctuaryEnv = (): SanctuaryEnv => {
  if (!cached) cached = Object.fromEntries(REQUIRED.map((key) => [key, readRequired(key)])) as SanctuaryEnv;
  return cached;
};

export { readSanctuaryEnv };
export type { SanctuaryEnv };
