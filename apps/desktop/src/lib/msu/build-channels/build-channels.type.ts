/* @layer renderer-lib @kind types */
import type { MsuPackManifest } from '@rotp/game-data';
import type { LoadBytes } from '../track-loader';

interface BuildChannelsParams {
  ctx: BaseAudioContext;
  musicOut: AudioNode;
  ambientOut: AudioNode;
  sfxOut: AudioNode;
  manifest: MsuPackManifest;
  loadBytes: LoadBytes;
  resumeEnabled?: () => boolean;
  onError?: (message: string) => void;
  onTrack?: (trackNum: number, layerCount: number, resumed: boolean) => void;
  onAmbient?: (soundId: number, layerCount: number, resumed: boolean) => void;
}

export type { BuildChannelsParams };
