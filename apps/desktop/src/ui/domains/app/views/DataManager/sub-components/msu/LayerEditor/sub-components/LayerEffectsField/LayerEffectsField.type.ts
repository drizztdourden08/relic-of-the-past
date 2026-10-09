/* @layer renderer-components @kind types */
import type { LayerEffect } from '@rotp/game-data';

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

interface EffectPreset {
  id: string;
  label: string;
  description: string;
  effects: LayerEffect[];
}

export type { LayerEffectsFieldProps, EffectRowProps, EffectPreset };
