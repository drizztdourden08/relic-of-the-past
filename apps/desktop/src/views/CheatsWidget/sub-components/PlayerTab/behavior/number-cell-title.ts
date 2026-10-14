/* @layer renderer-widgets @kind logic */
const numberCellTitle = (label: string, lockedReason: string | undefined): string =>
  (lockedReason ? `${label}: ${lockedReason}` : `${label}: set by the seed`);

export { numberCellTitle };
