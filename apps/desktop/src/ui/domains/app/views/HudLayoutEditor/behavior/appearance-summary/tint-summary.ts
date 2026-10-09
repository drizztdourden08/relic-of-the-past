/* @layer renderer-components @kind logic */
import { summaryNumber } from './summary-number';
import type { HudTint } from '@rotp/hud';

const tintSummary = (tint: HudTint | undefined): string => (
  tint ? `${tint.mode ?? 'multiply'} ${summaryNumber(tint.amount, '1')}` : 'off'
);

export { tintSummary };
