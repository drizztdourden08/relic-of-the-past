/* @layer store-site @kind logic */
const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

export { clamp };
