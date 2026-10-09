/* @layer renderer-hud @kind logic */
const fillSprites = (fillLevel: number): string[] => {
  const fills: string[] = ['hud-magic-fill-empty', 'hud-magic-fill-empty', 'hud-magic-fill-empty', 'hud-magic-fill-empty'];

  for (let row = 3; row >= 0; row--) {
    const rowStart = (3 - row) * 4;
    const rowFill = fillLevel - rowStart;

    if (rowFill <= 0) {
      fills[row] = 'hud-magic-fill-empty';
    } else if (rowFill >= 4) {
      fills[row] = 'hud-magic-fill-full';
    } else if (rowFill === 1) {
      fills[row] = 'hud-magic-cap';
    } else if (rowFill === 2) {
      fills[row] = 'hud-magic-fill-quarter';
    } else if (rowFill === 3) {
      fills[row] = 'hud-magic-fill-half';
    }
  }

  return fills;
};

export { fillSprites };
