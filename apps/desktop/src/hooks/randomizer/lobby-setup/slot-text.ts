/* @layer renderer-lib @kind logic */
import type { PatternSlotValue } from '@drizztdourden08/tessera/composites';

const slotText = (value: PatternSlotValue | undefined): string => (value === null || value === undefined ? '' : String(value).trim());

export { slotText };
