/* @layer shared-game @kind constants */
import { find } from '@rotp/game-data';

const CHEST_OPEN_MASKS = [0x10, 0x20, 0x40, 0x80, 0x100, 0x200, 0x400] as const;

const ALL_CHECKS = find('check', () => true);

const WHOLE_BYTE_MASK = 0xff;

export { CHEST_OPEN_MASKS, ALL_CHECKS, WHOLE_BYTE_MASK };
