/* @layer renderer-components @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';
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
  label: Message;
  description: Message;
  effects: LayerEffect[];
}

interface EffectChoice {
  value: string;
  label: Message;
  description: Message;
}

export type { LayerEffectsFieldProps, EffectRowProps, EffectPreset, EffectChoice };
