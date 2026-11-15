/* @layer shared-asset-extraction @kind logic */
const linearToSnes = (offset: number): number =>
  ((((offset >>> 15) & 0x7f) | 0x80) << 16) + 0x8000 + (offset & 0x7fff);

export { linearToSnes };
