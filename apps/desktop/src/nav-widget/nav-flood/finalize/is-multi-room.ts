/* @layer renderer-widgets @kind logic */
import type { EffectiveLayout } from '../nav-flood.type';

const isMultiRoom = (layout: EffectiveLayout | undefined, hasIntraEdges: boolean, roomCount: number): boolean => {
  const spansRooms = layout ? layout.width > 1 || layout.height > 1 : hasIntraEdges;
  return spansRooms || roomCount > 1;
};

export { isMultiRoom };
