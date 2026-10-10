/* @layer electron-main @kind logic */
const pickEvenlySpread = <T,>(items: T[], count: number): T[] => {
  if (count >= items.length) return items;
  if (count <= 0) return [];
  const stride = items.length / count;
  const picked = new Set(Array.from({ length: count }, (_, i) => Math.floor(i * stride)));
  return items.filter((_, index) => picked.has(index));
};

export { pickEvenlySpread };
