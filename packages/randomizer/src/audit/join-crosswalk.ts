/* @layer shared-game @kind logic */
const joinCrosswalk = (
  tableIndex: number,
  chestTable: readonly { roomId: number }[],
): { roomId: number; chestIndex: number } | null => {
  if (!Number.isInteger(tableIndex) || tableIndex < 0 || tableIndex >= chestTable.length) {
    return null;
  }
  const { roomId } = chestTable[tableIndex];
  let chestIndex = 0;
  for (let i = 0; i < tableIndex; i++) {
    if (chestTable[i].roomId === roomId) chestIndex += 1;
  }
  return { roomId, chestIndex };
};

export { joinCrosswalk };
