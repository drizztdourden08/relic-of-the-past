/* @layer shared-asset-extraction @kind logic */
const overlapsTail = (big: readonly number[], little: readonly number[], n: number): boolean => {
  for (let k = 0; k < n; k++) {
    if (big[big.length - n + k] !== little[k]) return false;
  }
  return true;
};

const appendScanBytes = (big: number[], little: number[]): number => {
  for (let n = little.length; n > 0; n--) {
    if (overlapsTail(big, little, n)) {
      const offset = big.length - n;
      big.push(...little.slice(n));
      return offset;
    }
  }
  const offset = big.length;
  big.push(...little);
  return offset;
};

export { appendScanBytes };
