/* @layer shared-game @kind constants */
const DIRECTIONS: readonly [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const ENTRANCE_REACH = { before: 3, after: 5 } as const;

export { DIRECTIONS, ENTRANCE_REACH };
