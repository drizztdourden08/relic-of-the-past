/* @layer renderer-components @kind types */
import type { LayerEffect } from '@shared/types/msu-manifest';

interface LayerEffectsFieldProps {
  effects: LayerEffect[];
  layerId: string;
  disabled?: boolean;
  onChange: (effects: LayerEffect[]) => void;
}

interface EffectRowProps {
  effect: LayerEffect;
  index: number;
  disabled: boolean;
  onChange: (effect: LayerEffect) => void;
  onRemove: () => void;
}

export type { LayerEffectsFieldProps, EffectRowProps };
