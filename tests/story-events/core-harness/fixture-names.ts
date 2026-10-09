/* @layer test @kind helper */
import { existsSync, readdirSync } from 'node:fs';
import { SAVE_STATE_FIXTURES } from './core-harness.constants';

const fixtureNames = (): string[] => {
  if (!existsSync(SAVE_STATE_FIXTURES)) return [];
  return readdirSync(SAVE_STATE_FIXTURES).filter((f) => f.endsWith('.sav')).map((f) => f.slice(0, -4)).sort();
};

export { fixtureNames };
