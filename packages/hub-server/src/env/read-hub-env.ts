/* @layer hub-core @kind logic */
import { DEFAULT_GITHUB_REPO, REQUIRED } from './env.constants';
import type { HubEnv, RequiredKey } from './env.type';
import { readRequired } from './read-required';
import { trimmedEnv } from './trimmed-env';

const parseAdminIds = (raw: string | undefined): string[] =>
  (raw ?? '').split(',').map((entry) => entry.trim()).filter((entry) => entry.length > 0);

let cached: HubEnv | null = null;

const readHubEnv = (): HubEnv => {
  if (cached) return cached;
  const required = Object.fromEntries(REQUIRED.map((key) => [key, readRequired(key)])) as Record<RequiredKey, string>;
  cached = {
    ...required,
    GITHUB_REPO: trimmedEnv('GITHUB_REPO') ?? DEFAULT_GITHUB_REPO,
    SANCTUARY_ADMIN_IDS: parseAdminIds(process.env.SANCTUARY_ADMIN_IDS),
    SWEEP_KEY: trimmedEnv('SWEEP_KEY'),
    SCHEDULER_SA: trimmedEnv('SCHEDULER_SA')?.toLowerCase() ?? null,
    DISCORD_CONTRIBUTOR_ROLE_ID: trimmedEnv('DISCORD_CONTRIBUTOR_ROLE_ID'),
    DISCORD_BOT_TOKEN: trimmedEnv('DISCORD_BOT_TOKEN'),
  };
  return cached;
};

export { readHubEnv };
