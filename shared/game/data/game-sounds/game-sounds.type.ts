/* @layer shared-game-data @kind types */
import type { SoundChannel } from '@shared/types/msu-manifest';

interface GameSound {
  channel: SoundChannel;
  id: number;
  label: string | null;
  triggers: string[];
  sites: number;
}

type RawGameSound = Omit<GameSound, 'label'>;

export type { GameSound, RawGameSound };
