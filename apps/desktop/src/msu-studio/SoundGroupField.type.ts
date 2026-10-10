/* @layer renderer-components @kind types */
import type { MsuPackManifest, SoundChannel } from '@rotp/game-data';

interface SoundGroupFieldProps {
  pack: string;
  channel: SoundChannel;
  soundId: number;
  group: string | undefined;
  saveBase: MsuPackManifest;
  disabled?: boolean;
  onSaved: () => void;
}

export type { SoundGroupFieldProps };
