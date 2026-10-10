/* @layer shared-store @kind logic */
const u16 = (b: Uint8Array, at: number): number => (b[at] ?? 0) | ((b[at + 1] ?? 0) << 8);

export { u16 };
