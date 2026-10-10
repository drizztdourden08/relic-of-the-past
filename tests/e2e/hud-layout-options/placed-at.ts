/* @layer tests @kind helper */
const placedAt = (placed: Record<string, number[]>, id: string | undefined, axis: number): number => {
  const value = id === undefined ? undefined : placed[id]?.[axis];
  if (value === undefined) throw new Error(`no placed box for ${String(id)}`);
  return value;
};

export { placedAt };
