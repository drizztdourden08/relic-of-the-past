/* @layer renderer-hud @kind logic */
import type { SliceState } from '../HudPie.type';

const sliceStateAt = (index: number, sliceCount: number, slicesLeft: number): SliceState => {
  const gone = sliceCount - Math.min(Math.max(0, slicesLeft), sliceCount);
  if (index < gone) return 'gone';
  return index === gone ? 'next' : 'idle';
};

export { sliceStateAt };
