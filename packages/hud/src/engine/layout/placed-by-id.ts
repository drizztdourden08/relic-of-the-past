/* @layer shared-hud @kind logic */
import type { PlacedNode } from '../engine.type';

const placedById = (placed: readonly PlacedNode[], id: string): PlacedNode | undefined =>
  placed.find((node) => node.id === id);

export { placedById };
