/* @layer renderer-components @kind types */
import type { LightSource } from '@shared/types/shadow-casting';

interface ShadowLightInspectorProps {
  screenId: number;
  selectedLight: LightSource;
  updateLight: (screenId: number, id: string, patch: Partial<LightSource>) => void;
  handleDelete: () => void;
}

export type { ShadowLightInspectorProps };
