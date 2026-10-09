/* @layer root-config @kind logic */
import { readRequired } from '@rotp/hub-server';
import { REQUIRED_SANCTUARY_ENV } from './env.constants';
import type { SanctuaryEnv } from './env.type';

let cached: SanctuaryEnv | null = null;

const readSanctuaryEnv = (): SanctuaryEnv => {
  if (!cached) cached = Object.fromEntries(REQUIRED_SANCTUARY_ENV.map((key) => [key, readRequired(key)])) as SanctuaryEnv;
  return cached;
};

export { readSanctuaryEnv };
