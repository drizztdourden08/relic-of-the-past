/* @layer renderer-components @kind types */
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import type { MsuFile } from './msu.type';

interface MsuSoundPanelProps {
  pack: string;
  channel: SoundChannel;
  manifest: MsuPackManifest;
  saveBase: MsuPackManifest;
  files: MsuFile[];
  isLayered: boolean;
  readOnly: boolean;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onReload: () => void;
}

export type { MsuSoundPanelProps };
