/* @layer hub-core @kind logic */
const decodeCursor = (cursor: string | undefined): number | null => {
  if (!cursor) return null;
  const value = Number(cursor);
  return Number.isFinite(value) ? value : null;
};

export { decodeCursor };
