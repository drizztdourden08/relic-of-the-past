/* @layer renderer-components @kind logic */
import { SECOND_HALVES } from './merged-glyph.constants';

const isMergedSecond = (name: string): boolean => SECOND_HALVES.has(name);

export { isMergedSecond };
