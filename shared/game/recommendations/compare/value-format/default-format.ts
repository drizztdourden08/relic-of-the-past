/* @layer shared-game @kind logic */
const defaultFormat = (value: unknown): string => {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export { defaultFormat };
