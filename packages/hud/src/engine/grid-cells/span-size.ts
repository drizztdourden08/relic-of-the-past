/* @layer shared-hud @kind logic */
const spanSize = (sizes: readonly number[], start: number, count: number, gap: number): number => {
  let total = 0;
  for (let i = start; i < start + count && i < sizes.length; i += 1) total += sizes[i] ?? Number.NaN;
  return total + gap * Math.max(0, count - 1);
};

export { spanSize };
