/* @layer renderer-hud @kind logic */
import type { MeterBand } from '../HudMeter.type';

const bandRows = (top: number, height: number, count: number, gap: number): MeterBand[] => {
  const h = (height - gap * (count - 1)) / count;
  return Array.from({ length: count }, (_unused, i) => ({ y: top + i * (h + gap), h }));
};

export { bandRows };
