/* @layer hub-core @kind logic */
import { DEFAULT_GITHUB_REPO, REQUIRED } from './env.constants';
import type { HubEnv, RequiredKey } from './env.type';
import { readRequired } from './read-required';

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

export { readHubEnv };
