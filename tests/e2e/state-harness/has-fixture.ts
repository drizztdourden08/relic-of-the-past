/* @layer tests @kind helper */
import { existsSync } from 'fs';
import { join } from 'path';
import { FIXTURES } from './state-harness.constants';

const hasFixture = (name: string): boolean => existsSync(join(FIXTURES, `${name}.sav`));

export { hasFixture };
