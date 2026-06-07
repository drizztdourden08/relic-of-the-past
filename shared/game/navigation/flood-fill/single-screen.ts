/* @layer shared-game @kind logic */
/**
 * Single-screen flood-fill BFS — barrel.
 * Implementation split across single-layer / dual-layer{,-steps,-result} / bfs-helpers.
 */
export { floodFillBFS } from './single-layer';
export { floodFillBFSDualLayer } from './dual-layer';
export type { QuadrantBounds } from './bfs-helpers';
