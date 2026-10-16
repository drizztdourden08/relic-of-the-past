/* @layer renderer-components @kind types */
import type { HeightmapElement } from '@rotp/game-core';

interface ShadowShapeInspectorProps {
  screenId: number;
  selectedHm: HeightmapElement;
  updateHeightmapElement: (screenId: number, id: string, patch: Partial<HeightmapElement>) => void;
  handleDelete: () => void;
}

export type { ShadowShapeInspectorProps };
