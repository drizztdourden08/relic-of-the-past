/* @layer bridge-wasm @kind logic */
const ratioToString = (ratio: number, height: number): string => {
  const width = Math.max(2, Math.round((ratio * height) / 2) * 2);
  return `${width}:${height}`;
};

export { ratioToString };
