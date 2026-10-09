/* @layer renderer-components @kind types */
import type { SoundChannel } from '@rotp/game-data';

interface EffectQuery {
  channel: SoundChannel | null;
  text: string;
}

export type { EffectQuery };
