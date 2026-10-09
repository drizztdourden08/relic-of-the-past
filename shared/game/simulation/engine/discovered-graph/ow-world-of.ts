/* @layer shared-game @kind logic */
import { DARK_WORLD_SCREEN_BASE } from '../../overworld.constants';
import type { OverworldWorld } from './discovered-graph.type';

const owWorldOf = (screenId: string): OverworldWorld | undefined => {
  const m = /^(?:lw|dw)-([0-9a-f]{2})$/.exec(screenId) ?? /^ow:(\d+)$/.exec(screenId);
  if (!m) return undefined;
  const idx = screenId.startsWith('ow:') ? Number(m[1]) : parseInt(m[1], 16);
  if (!Number.isFinite(idx)) return undefined;
  return screenId.startsWith('dw-') || idx >= DARK_WORLD_SCREEN_BASE ? 'dark' : 'light';
};

export { owWorldOf };
