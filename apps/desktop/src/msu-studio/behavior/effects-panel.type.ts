/* @layer renderer-components @kind types */
import type { SoundChannel } from '@rotp/game-data';
import type { SoundPanelController } from '../msu.type';

type EffectRow = { channel: SoundChannel; row: SoundPanelController['rows'][number] };

export type { EffectRow };
