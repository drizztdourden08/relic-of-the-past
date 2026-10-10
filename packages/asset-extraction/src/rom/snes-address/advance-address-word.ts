/* @layer shared-asset-extraction @kind logic */
const advanceAddressWord = (ea: number): number => {
  const next = ea + 2;
  return (next & 0x8000) === 0 ? next + 0x8000 : next;
};

export { advanceAddressWord };
