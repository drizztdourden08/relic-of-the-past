/* @layer shared-asset-extraction @kind logic */
import { ROOM_BANK_BASE } from './second-cartridge-bank.constants';

const bankedRoomId = (gbaRoomId: number): number => ROOM_BANK_BASE + gbaRoomId;

export { bankedRoomId };
