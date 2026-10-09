/* @layer shared-game @kind logic */
const parseFreeJumps = (text: string): number[] | undefined => {
  const tokens = text.split(',').map((token) => token.trim()).filter((token) => token !== '');
  const jumps: number[] = [];
  for (const token of tokens) {
    if (!/^\d+$/.test(token)) return undefined;
    jumps.push(Number.parseInt(token, 10));
  }
  return jumps;
};

export { parseFreeJumps };
