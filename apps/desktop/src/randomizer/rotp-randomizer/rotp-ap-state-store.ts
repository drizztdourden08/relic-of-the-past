/* @layer renderer-app @kind logic */
import { getApReceivedIndex, getApRoomHash, setApReceivedIndex, setApRoomHash } from '@rotp/randomizer';
import type { ApStateStore } from '@drizztdourden08/brock-randomizer/session';

const memory = { receivedIndex: 0 };

const rotpApStateStore: ApStateStore = {
  read: () => ({ receivedIndex: getApReceivedIndex() ?? memory.receivedIndex, roomHash: String(getApRoomHash()) }),
  write: ({ receivedIndex, roomHash }) => {
    memory.receivedIndex = receivedIndex;
    setApReceivedIndex(receivedIndex);
    const hash = Number(roomHash);
    if (Number.isFinite(hash)) setApRoomHash(hash);
  },
};

export { rotpApStateStore };
