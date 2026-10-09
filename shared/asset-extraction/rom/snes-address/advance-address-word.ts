/* @layer shared-asset-extraction @kind logic */
const advanceAddressWord = (ea: number): number => {
  ea += 2;
  if ((ea & 0x8000) === 0) {
    ea += 0x8000;
  }
  return ea;
};

export { advanceAddressWord };
