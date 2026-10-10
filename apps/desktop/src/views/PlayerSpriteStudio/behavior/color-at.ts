/* @layer renderer-components @kind logic */
const colorAt = (palette: readonly number[], index: number): number => {
  const color = palette[index];
  if (color === undefined) throw new Error(`palette has no colour ${index}`);
  return color;
};

export { colorAt };
