/* @layer shared-asset-extraction @kind logic */
const toStr = (s: unknown): string => {
  if (typeof s === 'string') return s;
  if (typeof s === 'number') return String(s);
  if (s && typeof s === 'object' && 'name' in s) return (s as { name: string }).name;
  return String(s);
};

export { toStr };
