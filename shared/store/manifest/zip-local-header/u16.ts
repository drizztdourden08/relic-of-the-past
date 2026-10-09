/* @layer shared-store @kind logic */
const u16 = (b: Uint8Array, at: number): number => b[at] | (b[at + 1] << 8);

export { u16 };
