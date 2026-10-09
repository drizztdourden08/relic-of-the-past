/* @layer renderer-components @kind logic */
const rangeLabelOf = (stops: readonly (string | number)[], range: readonly [number, number]): string =>
  `${stops[range[0]]} to ${stops[range[1]]}`;

export { rangeLabelOf };
