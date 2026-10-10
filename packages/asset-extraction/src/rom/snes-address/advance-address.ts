/* @layer shared-asset-extraction @kind logic */
const advanceAddress = (ea: number): number => {
  const next = ea + 1;
  return (next & 0xffff) === 0 ? next + 0x8000 : next;
};

export { advanceAddress };
