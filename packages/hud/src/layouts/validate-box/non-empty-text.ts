/* @layer shared-hud @kind logic */
const nonEmptyText = (value: unknown): string => (typeof value === 'string' && value.trim() ? value : '');

export { nonEmptyText };
