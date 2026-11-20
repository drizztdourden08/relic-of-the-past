/* @layer shared-game-data @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { SoundChannel } from '../../manifest/msu-manifest.type';

interface GameSound {
  channel: SoundChannel;
  id: number;
  label: Message | null;
  triggers: string[];
  sites: number;
}

type RawGameSound = Omit<GameSound, 'label'>;

export type { GameSound, RawGameSound };
