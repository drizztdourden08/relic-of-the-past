/* @layer shared-asset-extraction @kind logic */
const snesToLinear = (ea: number): number => {
  if ((ea & 0x8000) === 0) {
    throw new Error(`Invalid SNES address 0x${ea.toString(16)}: bit 15 not set`);
  }
  return ((ea >>> 16) & 0x7f) * 0x8000 + (ea & 0x7fff);
};

export { snesToLinear };
