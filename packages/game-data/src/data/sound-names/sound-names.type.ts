/* @layer shared-game-data @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { SoundChannel } from '../../manifest/msu-manifest.type';

interface SoundNameRecord {
  channel: SoundChannel;
  id: number;
  name: Message;
}

export type { SoundNameRecord };
