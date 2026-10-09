/* @layer electron-main @kind logic */
const pickEvenlySpread = <T,>(items: T[], count: number): T[] => {
  if (count >= items.length) return items;
  if (count <= 0) return [];
  const stride = items.length / count;
  return Array.from({ length: count }, (_, i) => items[Math.floor(i * stride)]);
};

export { pickEvenlySpread };
