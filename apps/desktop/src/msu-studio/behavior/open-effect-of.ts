/* @layer renderer-components @kind logic */
import { EFFECT_CHANNELS } from '../sound-labels';
import type { SoundPanelController } from '../msu.type';
import type { OpenEffect } from './effects-panel.type';

const [FIRST, SECOND] = EFFECT_CHANNELS;

const openEffectOf = (first: SoundPanelController, second: SoundPanelController): OpenEffect | null => {
  if (first.openSound !== null) return { channel: FIRST, soundId: first.openSound };
  if (second.openSound !== null) return { channel: SECOND, soundId: second.openSound };
  return null;
};

export { openEffectOf };
