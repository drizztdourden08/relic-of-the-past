/* @layer bridge-wasm @kind logic */
import { getModule, hasCoreExport } from '@rotp/game-core';
import { GET_EXPORT, NO_ROOM } from './ap-room-hash.constants';

const getApRoomHash = (): number => {
  const mod = getModule();
  if (!mod || !hasCoreExport(GET_EXPORT)) return NO_ROOM;
  try {
    return (mod.ccall(GET_EXPORT, 'number', [], []) as number) >>> 0;
  } catch {
    return NO_ROOM;
  }
};

export { getApRoomHash };
