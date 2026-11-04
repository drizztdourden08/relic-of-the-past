/* @layer renderer-app @kind logic */
import type { HeapReads } from '@rotp/randomizer';
import type { MemoryView } from '@drizztdourden08/brock-randomizer/session';
import { OVERWORLD_REGION, PROGRESS_REGION, ROOM_REGION } from './rotp-memory.constants';

const ABSENT = 0;

const memoryViewOf = (reads: HeapReads): MemoryView => ({
  byte: (region, offset) => {
    if (region === OVERWORLD_REGION) return reads.owByte(offset);
    if (region === PROGRESS_REGION) return reads.progByte(offset);
    return ABSENT;
  },
  word: (region, offset) => (region === ROOM_REGION ? reads.roomWord(offset) : ABSENT),
});

export { memoryViewOf };
