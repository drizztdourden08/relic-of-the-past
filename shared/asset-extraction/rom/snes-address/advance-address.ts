/* @layer shared-asset-extraction @kind logic */
const advanceAddress = (ea: number): number => {
  ea += 1;
  if ((ea & 0xffff) === 0) {
    ea += 0x8000;
  }
  return ea;
};

export { advanceAddress };
