/* @layer renderer-hud @kind logic */
import type { HudTextSpec } from '@rotp/hud';
import { flatColor } from './flat-color';

const textColor = (spec: HudTextSpec, isGameFont: boolean): string => {
  if (spec.color) return flatColor(spec.color);
  return isGameFont ? 'var(--game-ink)' : '#fff';
};

export { textColor };
