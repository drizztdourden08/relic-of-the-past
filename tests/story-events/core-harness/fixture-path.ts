/* @layer test @kind helper */
import { resolve } from 'node:path';
import { SAVE_STATE_FIXTURES } from './core-harness.constants';

const fixturePath = (name: string): string => resolve(SAVE_STATE_FIXTURES, `${name}.sav`);

export { fixturePath };
