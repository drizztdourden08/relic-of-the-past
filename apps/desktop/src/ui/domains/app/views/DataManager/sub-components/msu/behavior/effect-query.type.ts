/* @layer renderer-components @kind types */
import type { SoundChannel } from '@shared/types/msu-manifest';

interface EffectQuery {
  channel: SoundChannel | null;
  text: string;
}

export type { EffectQuery };
