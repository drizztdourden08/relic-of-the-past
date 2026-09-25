/* @layer root-config @kind logic */
/** Typed view of the function's environment. Plain values arrive through
 *  --set-env-vars, secrets through --set-secrets; both land in process.env.
 *  Read lazily so a build or typecheck never needs the deploy environment. */
type Env = {
  SANCTUARY_ORIGIN: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_GUILD_ID: string;
  /** Seeds the default group's linked role; the groups hold role ids after that. */
  DISCORD_CONTRIBUTOR_ROLE_ID: string | null;
  /** A bot with no permissions in the server; only lists its roles for the group editor. */
  DISCORD_BOT_TOKEN: string | null;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_READ_TOKEN: string;
  GITHUB_REPO: string;
  GITHUB_ISSUE_TOKEN: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  B2_KEY_ID: string;
  B2_APP_KEY: string;
  B2_BUCKET: string;
  B2_ENDPOINT: string;
  B2_REGION: string;
  SANCTUARY_SESSION_KEY: string;
  SANCTUARY_ADMIN_IDS: string[];
  SWEEP_KEY: string | null;
};

const REQUIRED = [
  'SANCTUARY_ORIGIN',
  'DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET', 'DISCORD_GUILD_ID',
  'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'GITHUB_READ_TOKEN', 'GITHUB_ISSUE_TOKEN',
  'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
  'B2_KEY_ID', 'B2_APP_KEY', 'B2_BUCKET', 'B2_ENDPOINT', 'B2_REGION',
  'SANCTUARY_SESSION_KEY',
] as const;

type RequiredKey = (typeof REQUIRED)[number];

const DEFAULT_GITHUB_REPO = 'drizztdourden08/relic-of-the-past';

const readRequired = (key: RequiredKey): string => {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing environment variable ${key}`);
  return value;
};

const parseAdminIds = (raw: string | undefined): string[] =>
  (raw ?? '').split(',').map((entry) => entry.trim()).filter((entry) => entry.length > 0);

let cached: Env | null = null;

const readEnv = (): Env => {
  if (cached) return cached;
  const required = Object.fromEntries(REQUIRED.map((key) => [key, readRequired(key)])) as Record<RequiredKey, string>;
  cached = {
    ...required,
    GITHUB_REPO: process.env.GITHUB_REPO?.trim() || DEFAULT_GITHUB_REPO,
    SANCTUARY_ADMIN_IDS: parseAdminIds(process.env.SANCTUARY_ADMIN_IDS),
    SWEEP_KEY: process.env.SWEEP_KEY?.trim() || null,
    DISCORD_CONTRIBUTOR_ROLE_ID: process.env.DISCORD_CONTRIBUTOR_ROLE_ID?.trim() || null,
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN?.trim() || null,
  };
  return cached;
};

/** The provider callback URL, fixed by the Hosting rewrite: /api/auth/<provider>/callback. */
const callbackUrlFor = (provider: string): string => `${readEnv().SANCTUARY_ORIGIN}/api/auth/${provider}/callback`;

export { readEnv, callbackUrlFor };
export type { Env };
