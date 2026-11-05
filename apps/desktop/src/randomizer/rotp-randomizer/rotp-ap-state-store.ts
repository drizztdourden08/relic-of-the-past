/* @layer renderer-app @kind logic */
import { getApReceivedIndex, getApRoomHash, setApReceivedIndex, setApRoomHash } from '@rotp/randomizer';
import type { ApStateStore } from '@drizztdourden08/brock-randomizer/session';
import { NO_ROOM } from './rotp-ap-state-store.constants';

const memory = { receivedIndex: 0 };

const roomHashText = (hash: number): string => (hash === NO_ROOM ? '' : String(hash));

const rotpApStateStore: ApStateStore = {
  read: () => ({ receivedIndex: getApReceivedIndex() ?? memory.receivedIndex, roomHash: roomHashText(getApRoomHash()) }),
  write: ({ receivedIndex, roomHash }) => {
    memory.receivedIndex = receivedIndex;
    setApReceivedIndex(receivedIndex);
    const hash = roomHash === '' ? NO_ROOM : Number(roomHash);
    if (Number.isFinite(hash)) setApRoomHash(hash);
  },
};

export { rotpApStateStore };
