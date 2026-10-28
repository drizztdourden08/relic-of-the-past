/* @layer website-site @kind logic */
import { GAP_EM, ROW_GAP_PX } from '../CloudStage.constants';
import type { CloudFontRange, CloudItem, CloudRow, CloudRows, CloudTriangle } from '../CloudStage.type';

const rowsOf = (items: readonly CloudItem[], shape: readonly number[], triangle: CloudTriangle, range: CloudFontRange): CloudRows | null => {
  const slope = (triangle.half * 2) / triangle.height;
  const rows: CloudRow[] = [];
  let depth = 0;
  let from = 0;
  let waste = 0;

  for (const count of shape) {
    const row = items.slice(from, from + count);
    const reach = row.reduce((sum, item) => sum + item.ratio.width, 0) + GAP_EM * (count - 1);
    const tall = Math.max(...row.map((item) => item.ratio.height));
    const lead = tall / 2;
    const room = reach - slope * lead;
    const fit = (slope * depth) / room;
    let fontPx = Math.min(fit, range.max);

    if (fontPx < range.min) {
      fontPx = range.min;
      depth = (range.min * room) / slope;
    }
    const height = tall * fontPx;
    rows.push({ count, fontPx, top: depth, height, reach: slope * (depth + height / 2) });
    waste += (1 - (reach * fontPx) / (slope * (depth + height / 2))) ** 2;
    depth += height + ROW_GAP_PX;
    from += count;
  }
  const used = depth - ROW_GAP_PX;
  if (used > triangle.height) return null;
  return { rows, score: waste + ((triangle.height - used) / triangle.height) ** 2 };
};

export { rowsOf };
