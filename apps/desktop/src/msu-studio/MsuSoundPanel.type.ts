/* @layer renderer-components @kind types */
import type { SoundChannel } from '@rotp/game-data';
import type { MsuEffectsPanelProps } from './msu.type';

interface MsuSoundPanelProps extends MsuEffectsPanelProps {
  channel: SoundChannel;
}

export type { MsuSoundPanelProps };
