/* @layer shared-asset-extraction @kind logic */
const signed8 = (v: number): number => (v << 24) >> 24;

export { signed8 };
