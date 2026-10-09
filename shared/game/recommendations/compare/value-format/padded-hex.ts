/* @layer shared-game @kind logic */
const paddedHex = (value: unknown, mask: number, digits: number): string => (
  typeof value === 'number' && Number.isFinite(value)
    ? `0x${(value & mask).toString(16).toUpperCase().padStart(digits, '0')}`
    : '-'
);

export { paddedHex };
