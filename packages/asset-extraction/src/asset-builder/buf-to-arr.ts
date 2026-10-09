/* @layer shared-asset-extraction @kind logic */
const bufToArr = (buf: Buffer): number[] => {
  return Array.from(buf);
};

export { bufToArr };
