/* @layer renderer-components @kind logic */
import { summaryNumber } from './summary-number';
import type { HudTint } from '@rotp/hud';
import type { Translate } from '../translate.type';

const tintSummary = (tint: HudTint | undefined, t: Translate): string => (
  tint ? `${tint.mode ?? 'multiply'} ${summaryNumber(tint.amount, '1')}` : t('hud-editing:summary.off')
);

export { tintSummary };
