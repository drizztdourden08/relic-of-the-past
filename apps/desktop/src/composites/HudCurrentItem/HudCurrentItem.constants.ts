/* @layer renderer-hud @kind constants */
const ITEMBOX_CELLS: readonly { piece: string; col: number; row: number }[] = [
  { piece: 'top', col: 1, row: 0 },
  { piece: 'top', col: 2, row: 0 },
  { piece: 'tr', col: 3, row: 0 },
  { piece: 'left', col: 0, row: 1 },
  { piece: 'left', col: 0, row: 2 },
  { piece: 'right', col: 3, row: 1 },
  { piece: 'right', col: 3, row: 2 },
  { piece: 'bl', col: 0, row: 3 },
  { piece: 'bottom', col: 1, row: 3 },
  { piece: 'bottom', col: 2, row: 3 },
  { piece: 'br', col: 3, row: 3 },
];

export { ITEMBOX_CELLS };
