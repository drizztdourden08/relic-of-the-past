/* @layer renderer-components @kind logic */
const updatesLine = (count: number): string =>
  count === 1 ? '1 update for a pack you installed' : `${count} updates for packs you installed`;

export { updatesLine };
