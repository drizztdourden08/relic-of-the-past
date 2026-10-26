/* @layer renderer-lib @kind logic */
import type { PatternValue } from '@drizztdourden08/tessera/composites';
import { slotText } from './slot-text';

const typedCode = (code: PatternValue): string => `${slotText(code.left)}${slotText(code.right)}`;

export { typedCode };
