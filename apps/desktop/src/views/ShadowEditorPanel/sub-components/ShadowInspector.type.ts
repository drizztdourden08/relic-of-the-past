/* @layer renderer-components @kind types */
import type { HeightmapElement, LightSource, ScreenShadowData } from '@rotp/game-core';

interface ShadowInspectorProps {
  screenId: number;
  screenData: ScreenShadowData;
  selectedHm: HeightmapElement | null | undefined;
  selectedLight: LightSource | null | undefined;
  handleDelete: () => void;
}

export type { ShadowInspectorProps };
