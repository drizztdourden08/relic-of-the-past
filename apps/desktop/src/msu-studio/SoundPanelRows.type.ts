/* @layer renderer-components @kind types */
import type { SoundChannel } from '@rotp/game-data';
import type { SoundListItemProps, SoundPanelController } from './msu.type';

type SoundPanelRowsProps = Pick<SoundListItemProps, 'onSelect' | 'onPreview' | 'onPlayOriginal'> & {
  channel: SoundChannel;
  sound: SoundPanelController;
  filter: string;
};

export type { SoundPanelRowsProps };
