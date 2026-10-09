/* @layer renderer-components @kind logic */
import { PAIRS } from './merged-glyph.constants';

const mergedSecondOf = (name: string): string | null => PAIRS.get(name) ?? null;

export { mergedSecondOf };
