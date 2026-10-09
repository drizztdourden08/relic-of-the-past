/* @layer renderer-components @kind types */
import type { MsuPackManifest, SoundChannel } from '@rotp/game-data';
import type { MsuFile } from '../msu.type';

interface SoundPanelParams {
  pack: string;
  channel: SoundChannel;
  filter: string;
  showUnreachable: boolean;
  manifest: MsuPackManifest;
  saveBase: MsuPackManifest;
  files: MsuFile[];
  reload: () => void;
}

export type { SoundPanelParams };
