/* @layer renderer-app @kind logic */
const asDisplayText = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') return value || undefined;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return undefined;
};

export { asDisplayText };
