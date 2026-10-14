/* @layer renderer-components @kind logic */
const hasPriceControl = (
  blocked: boolean,
  note: string,
  stops: readonly string[] | undefined,
  range: readonly [number, number] | undefined,
): boolean => (blocked && note !== '') || (stops !== undefined && range !== undefined);

export { hasPriceControl };
