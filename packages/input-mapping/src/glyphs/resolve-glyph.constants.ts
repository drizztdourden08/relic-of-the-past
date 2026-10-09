/* @layer shared-input @kind constants */
import { GENERIC_PACK_ID } from './built-in-packs';
import type { DeviceFamily } from '@rotp/game-data';

const AUTO_PACK_ID = 'auto';

const FAMILY_PACK_IDS: Record<DeviceFamily, string> = {
  xbox: 'xbox',
  playstation: 'playstation',
  nintendo: 'switch',
  '8bitdo': GENERIC_PACK_ID,
  keyboard: 'keyboard',
  generic: GENERIC_PACK_ID,
};

export { AUTO_PACK_ID, FAMILY_PACK_IDS };
