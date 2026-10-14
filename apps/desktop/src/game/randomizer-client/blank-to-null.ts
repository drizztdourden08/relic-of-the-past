/* @layer bridge-wasm @kind logic */
const blankToNull = (value: string | undefined): string | null => (value === undefined || value === '' ? null : value);

export { blankToNull };
