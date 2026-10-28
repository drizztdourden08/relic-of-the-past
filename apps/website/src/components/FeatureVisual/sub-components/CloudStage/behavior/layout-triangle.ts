/* @layer website-site @kind logic */
import { FILL, FLOOR_PX, GAP_EM, GAP_MAX_EM, SHRINK_LIMIT, SHRINK_STEP } from '../CloudStage.constants';
import type { CloudFontRange, CloudItem, CloudPlacement, CloudRows, CloudTriangle } from '../CloudStage.type';
import { compositionsOf } from './compositions-of';
import { rowsOf } from './rows-of';

const bestRowsOf = (items: readonly CloudItem[], triangle: CloudTriangle, range: CloudFontRange): CloudRows | null => {
  let best: CloudRows | null = null;

  for (const shape of compositionsOf(items.length)) {
    const result = rowsOf(items, shape, triangle, range);
    if (result && (!best || result.score < best.score)) best = result;
  }
  return best;
};

const layoutTriangle = (items: readonly CloudItem[], triangle: CloudTriangle, range: CloudFontRange): CloudPlacement[] => {
  let scale = 1;
  let found = bestRowsOf(items, triangle, range);

  for (let attempt = 0; !found && attempt < SHRINK_LIMIT; attempt += 1) {
    scale *= SHRINK_STEP;
    found = bestRowsOf(items, triangle, { min: Math.max(range.min * scale, FLOOR_PX), max: range.max * scale });
  }
  if (!found) return [];

  const { rows } = found;
  const last = rows[rows.length - 1];
  const spare = last ? triangle.height - (last.top + last.height) : 0;
  const placements: CloudPlacement[] = [];
  let from = 0;

  rows.forEach((row, index) => {
    const shift = rows.length > 1 ? (spare * index) / (rows.length - 1) : 0;
    const words = items.slice(from, from + row.count);
    const widths = words.map((item) => item.ratio.width * row.fontPx);
    const gaps = row.count > 1 ? Math.min(Math.max((row.reach * FILL - widths.reduce((a, b) => a + b, 0)) / (row.count - 1), GAP_EM * row.fontPx), GAP_MAX_EM * row.fontPx) : 0;
    let left = triangle.centerX - (widths.reduce((a, b) => a + b, 0) + gaps * (row.count - 1)) / 2;

    words.forEach((item, position) => {
      const width = widths[position] ?? 0;
      const height = item.ratio.height * row.fontPx;
      placements.push({ word: item.word, wrapped: item.wrapped, ratio: item.ratio, tone: 0, fontPx: row.fontPx, rect: { left, top: triangle.top + row.top + shift + (row.height - height) / 2, width, height } });
      left += width + gaps;
    });
    from += row.count;
  });
  return placements;
};

export { layoutTriangle };
