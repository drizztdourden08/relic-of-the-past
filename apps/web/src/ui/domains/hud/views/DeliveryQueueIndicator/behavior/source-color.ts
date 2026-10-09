/* @layer renderer-hud @kind logic */
import { PLAYER_SOURCE_COLOR, SOURCE_COLORS, UNKNOWN_SOURCE_COLOR } from '../DeliveryQueueIndicator.constants';

const sourceColor = (source: string): string => {
  const lower = source.toLowerCase();
  for (const [key, color] of Object.entries(SOURCE_COLORS)) {
    if (lower.startsWith(key)) return color;
  }
  if (lower.startsWith('player')) return PLAYER_SOURCE_COLOR;
  return UNKNOWN_SOURCE_COLOR;
};

export { sourceColor };
