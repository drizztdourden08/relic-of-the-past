/* @layer renderer-components @kind types */
import type { MsuSoundPanelProps } from './MsuSoundPanel.type';
import type { SoundPanelController } from './msu.type';

type SoundPanelRowsProps = Pick<
  MsuSoundPanelProps,
  'pack' | 'channel' | 'manifest' | 'saveBase' | 'isLayered' | 'readOnly' | 'onReload'
> & {
  sound: SoundPanelController;
  filter: string;
  availableFiles: string[];
  onConfirm: MsuSoundPanelProps['onDeleteConfirm'];
  onStopReplacing: (soundId: number) => void;
};

export type { SoundPanelRowsProps };
