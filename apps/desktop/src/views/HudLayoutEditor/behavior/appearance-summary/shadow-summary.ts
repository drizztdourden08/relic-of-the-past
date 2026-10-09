/* @layer renderer-components @kind logic */
import { paintText } from './paint-text';
import { summaryNumber } from './summary-number';
import type { HudShadow } from '@rotp/hud';

const shadowSummary = (shadow: HudShadow): string => {
  const spread = shadow.spread !== undefined && shadow.spread !== 0 ? ` ${summaryNumber(shadow.spread)}` : '';
  const inset = shadow.inset === true ? ' inset' : '';
  return `${summaryNumber(shadow.x)} ${summaryNumber(shadow.y)} ${summaryNumber(shadow.blur)}${spread} ${paintText(shadow.color)}${inset}`;
};

export { shadowSummary };
