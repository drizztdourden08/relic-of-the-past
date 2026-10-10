/* @layer tests @kind constants */
import type { CheckId, ConnectionId } from '@rotp/game-data';

const CHEST_OPEN_MASKS = [0x10, 0x20, 0x40, 0x80, 0x100, 0x200, 0x400] as const;
const KAKARIKO_TAVERN_ROOM = 0x103;
const LINKS_HOUSE_ROOM = 0x104;
const TAVERN_CHECK: CheckId = 'check-027';
const HOUSE_CHECK: CheckId = 'check-026';
const HAMMER_ID = 0x09;
const LAMP_ID = 0x12;
const BOMBS_ID = 0x28;
const EMPTY_PLACEMENT = { form: 'area' as const, tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } };
const CONNECTION_IDS = ['connection-t01', 'connection-t01r', 'connection-t02', 'connection-t02r'] as ConnectionId[];
const STEP_LIMIT = 500;

export {
  BOMBS_ID, CHEST_OPEN_MASKS, CONNECTION_IDS, EMPTY_PLACEMENT, HAMMER_ID, HOUSE_CHECK, KAKARIKO_TAVERN_ROOM, LAMP_ID,
  LINKS_HOUSE_ROOM, STEP_LIMIT, TAVERN_CHECK,
};
