/* @layer scripts @kind tooling */
import { readFileSync } from 'node:fs';
import { parseArgs, parseInteger, resolveGbaRom } from './common.mjs';

const ROOM_COUNT = 320;

const loadRoomRom = () => {
  const args = parseArgs(process.argv.slice(2));
  const roomId = parseInteger(args.room ?? '0x88', 'room');
  if (roomId < 0 || roomId >= ROOM_COUNT) throw new Error(`Room must be between 0 and ${ROOM_COUNT - 1}`);

  const romPath = resolveGbaRom(args.gba ?? args.rom);
  return { args, roomId, romPath, rom: readFileSync(romPath) };
};

export { loadRoomRom };
