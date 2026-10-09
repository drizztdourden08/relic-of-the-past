/* @layer hub-core @kind types */
import type { REQUIRED } from './env.constants';

type HubEnv = {
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_GUILD_ID: string;
  DISCORD_CONTRIBUTOR_ROLE_ID: string | null;
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
  SCHEDULER_SA: string | null;
};

type RequiredKey = (typeof REQUIRED)[number];

export type { HubEnv, RequiredKey };
