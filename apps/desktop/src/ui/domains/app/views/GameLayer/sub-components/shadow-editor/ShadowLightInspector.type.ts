/* @layer renderer-components @kind types */
import type { LightSource } from '@rotp/game-core';

interface ShadowLightInspectorProps {
  screenId: number;
  selectedLight: LightSource;
  updateLight: (screenId: number, id: string, patch: Partial<LightSource>) => void;
  handleDelete: () => void;
}

export type { ShadowLightInspectorProps };
