/* @layer shared-game @kind logic */
const joinCrosswalk = (
  tableIndex: number,
  chestTable: readonly { roomId: number }[],
): { roomId: number; chestIndex: number } | null => {
  const entry = chestTable[tableIndex];
  if (!Number.isInteger(tableIndex) || tableIndex < 0 || entry === undefined) return null;
  const { roomId } = entry;
  const chestIndex = chestTable.slice(0, tableIndex).filter((chest) => chest.roomId === roomId).length;
  return { roomId, chestIndex };
};

export { joinCrosswalk };
