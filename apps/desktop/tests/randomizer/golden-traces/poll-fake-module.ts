/* @layer tests @kind helper */
const ROOM_PTR = 0x100;
const LIVE_PTR = 0x400;
const OW_PTR = 0x500;
const PROG_PTR = 0x600;

const pollModule = {
  HEAPU8: new Uint8Array(0x800),
  completed: new Set<string>(),
  roomTableMissing: false,
  ccall: (name: string): number => {
    if (name === 'WasmGetRoomFlags') return pollModule.roomTableMissing ? 0 : ROOM_PTR;
    if (name === 'WasmGetLiveRoomFlags') return LIVE_PTR;
    if (name === 'WasmGetOverworldFlags') return OW_PTR;
    if (name === 'WasmGetProgressFlags') return PROG_PTR;
    return 0;
  },
};

export { LIVE_PTR, OW_PTR, PROG_PTR, ROOM_PTR, pollModule };
