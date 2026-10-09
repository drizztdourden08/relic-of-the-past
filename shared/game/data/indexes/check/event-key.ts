/* @layer shared-game @kind logic */
const eventKey = (bufferIndex: number, compare: string, value: number | number[] | undefined): string =>
  `${bufferIndex}:${compare}:${JSON.stringify(value)}`;

export { eventKey };
