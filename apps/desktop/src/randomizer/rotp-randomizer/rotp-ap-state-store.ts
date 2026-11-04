/* @layer renderer-app @kind logic */
import { getApRoomHash, readReceivedIndex, setApRoomHash, writeReceivedIndex } from '@rotp/randomizer';
import type { ApStateStore } from '@drizztdourden08/brock-randomizer/session';

const rotpApStateStore: ApStateStore = {
  read: () => ({ receivedIndex: readReceivedIndex(), roomHash: String(getApRoomHash()) }),
  write: ({ receivedIndex, roomHash }) => {
    writeReceivedIndex(receivedIndex);
    const hash = Number(roomHash);
    if (Number.isFinite(hash)) setApRoomHash(hash);
  },
};

export { rotpApStateStore };
