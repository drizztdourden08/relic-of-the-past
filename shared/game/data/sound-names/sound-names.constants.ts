/* @layer shared-game-data @kind constants */
import { recordsIn } from '../registry';
import type { SoundNameRecord } from './sound-names.type';
import { soundKey } from './sound-key';

const files = import.meta.glob('../records/names/sounds.ts', { eager: true });

const SOUND_NAMES_BY_KEY: ReadonlyMap<string, string> = new Map<string, string>(
  recordsIn<SoundNameRecord>(files).map((record) => [soundKey(record.channel, record.id), record.name]),
);

export { SOUND_NAMES_BY_KEY };
