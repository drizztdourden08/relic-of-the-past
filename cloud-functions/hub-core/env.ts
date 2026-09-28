/* @layer hub-core @kind logic */
/** Typed view of the account settings every site's function shares: the sign-in providers,
 *  the session key, the admin list, the scheduler key and the scheduler's account. Plain values arrive through
 *  --set-env-vars, secrets through --set-secrets; both land in process.env. Read lazily so a
 *  build or typecheck never needs the deploy environment. A site's own settings (its origin,
 *  its bucket) live in that function's env. */
type HubEnv = {
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
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SANCTUARY_SESSION_KEY: string;
  SANCTUARY_ADMIN_IDS: string[];
  SWEEP_KEY: string | null;
  /** The one service account Cloud Scheduler signs its calls as. Unset, no token is accepted. */
  SCHEDULER_SA: string | null;
};

const REQUIRED = [
  'DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET', 'DISCORD_GUILD_ID',
  'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'GITHUB_READ_TOKEN',
  'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
  'SANCTUARY_SESSION_KEY',
] as const;

type RequiredKey = (typeof REQUIRED)[number];

const DEFAULT_GITHUB_REPO = 'drizztdourden08/relic-of-the-past';

const readRequired = (key: string): string => {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing environment variable ${key}`);
  return value;
};

const parseAdminIds = (raw: string | undefined): string[] =>
  (raw ?? '').split(',').map((entry) => entry.trim()).filter((entry) => entry.length > 0);

let cached: HubEnv | null = null;

const readHubEnv = (): HubEnv => {
  if (cached) return cached;
  const required = Object.fromEntries(REQUIRED.map((key) => [key, readRequired(key)])) as Record<RequiredKey, string>;
  cached = {
    ...required,
    GITHUB_REPO: process.env.GITHUB_REPO?.trim() || DEFAULT_GITHUB_REPO,
    SANCTUARY_ADMIN_IDS: parseAdminIds(process.env.SANCTUARY_ADMIN_IDS),
    SWEEP_KEY: process.env.SWEEP_KEY?.trim() || null,
    SCHEDULER_SA: process.env.SCHEDULER_SA?.trim().toLowerCase() || null,
    DISCORD_CONTRIBUTOR_ROLE_ID: process.env.DISCORD_CONTRIBUTOR_ROLE_ID?.trim() || null,
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN?.trim() || null,
  };
  return cached;
};

export { readHubEnv, readRequired };
export type { HubEnv };
