/* @layer renderer-components @kind logic */
import { summaryNumber } from './summary-number';
import type { HudOutline } from '@rotp/hud';
import type { Translate } from '../translate.type';

const outlineSummary = (outline: HudOutline | undefined, t: Translate): string => (
  outline ? t('hud-editing:summary.outline', { width: summaryNumber(outline.width) }) : t('hud-editing:summary.off')
);

export { outlineSummary };
