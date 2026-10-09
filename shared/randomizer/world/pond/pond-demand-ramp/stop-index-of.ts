/* @layer shared-game @kind logic */
const stopIndexOf = (stops: readonly number[], amount: number): number => {
  const above = stops.findIndex((stop) => stop >= amount);
  return above === -1 ? stops.length - 1 : above;
};

export { stopIndexOf };
