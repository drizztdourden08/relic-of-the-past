/* @layer renderer-components @kind logic */
import { summaryNumber } from './summary-number';
import type { HudOutline } from '@rotp/hud';

const outlineSummary = (outline: HudOutline | undefined): string => (
  outline ? `${summaryNumber(outline.width)}px, ink` : 'off'
);

export { outlineSummary };
