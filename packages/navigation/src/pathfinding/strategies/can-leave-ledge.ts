/* @layer shared-game @kind logic */
const canLeaveLedge = (dir: string, dr: number, dc: number): boolean => (
  (dir === 's' && dr === 1) ||
  (dir === 'n' && dr === -1) ||
  (dir === 'e' && dc === 1) ||
  (dir === 'w' && dc === -1) ||
  (dir === 'ne' && (dr === -1 || dc === 1)) ||
  (dir === 'nw' && (dr === -1 || dc === -1)) ||
  (dir === 'se' && (dr === 1 || dc === 1)) ||
  (dir === 'sw' && (dr === 1 || dc === -1))
);

export { canLeaveLedge };
