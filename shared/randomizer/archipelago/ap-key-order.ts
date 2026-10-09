/* @layer shared-game @kind logic */
const compareApKeys = (left: string, right: string): number =>
  left.localeCompare(right, 'en', { numeric: true });

export { compareApKeys };
