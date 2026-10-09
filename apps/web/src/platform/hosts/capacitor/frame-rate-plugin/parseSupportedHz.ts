/* @layer renderer-other @kind logic */
const parseSupportedHz = (raw: string): number[] => raw
  .split(',')
  .map((part) => Number.parseFloat(part))
  .filter((hz) => Number.isFinite(hz) && hz > 0)
  .sort((a, b) => a - b);

export { parseSupportedHz };
