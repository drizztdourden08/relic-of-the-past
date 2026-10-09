/* @layer bridge-wasm @kind logic */
const parseRatioString = (ratio: string): number => {
  const [w, h] = ratio.split(':').map(Number);
  return w !== undefined && h !== undefined && w > 0 && h > 0 ? w / h : 0;
};

export { parseRatioString };
