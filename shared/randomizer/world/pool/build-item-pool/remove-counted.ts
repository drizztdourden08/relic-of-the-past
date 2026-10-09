/* @layer shared-game @kind logic */
const removeCounted = (items: string[], counts: ReadonlyMap<string, number>, table: string): void => {
  for (const [item, count] of counts) {
    for (let index = 0; index < count; index += 1) {
      const position = items.indexOf(item);
      if (position === -1) throw new Error(`${table} exceeds dungeon items: ${item}`);
      items.splice(position, 1);
    }
  }
};

export { removeCounted };
