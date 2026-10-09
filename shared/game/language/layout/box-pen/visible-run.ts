/* @layer shared-game @kind logic */
import type { BoxRow, Run } from './box-pen.type';

const visibleRun = (buf: BoxRow): Run => {
  const { stale } = buf;
  if (stale === null) return buf;

  const from = stale.offsets.findIndex(at => at >= buf.widthPx);
  const kept = from < 0 ? stale.offsets.length : from;

  return {
    glyphs: [...buf.glyphs, ...stale.glyphs.slice(kept)],
    offsets: [...buf.offsets, ...stale.offsets.slice(kept)],
    widthPx: Math.max(buf.widthPx, stale.widthPx),
  };
};

export { visibleRun };
