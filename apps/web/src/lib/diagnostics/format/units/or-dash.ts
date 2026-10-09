/* @layer renderer-lib @kind logic */
const orDash = (value: string | number | null | undefined): string =>
  value === null || value === undefined || value === '' ? '-' : String(value);

export { orDash };
