/* @layer shared-asset-extraction @kind logic */
const wrapTo15Bits = (s: number): number => (s & 0x3fff) - (s & 0x4000);

export { wrapTo15Bits };
