/* @layer tests @kind helper */
import type { PollEntry } from '@rotp/randomizer';
import { LIVE_PTR, OW_PTR, PROG_PTR, ROOM_PTR } from './poll-fake-module';

const keyOf = (text: string): PollEntry['key'] => text as PollEntry['key'];

const POLL_ENTRIES: PollEntry[] = [
  { key: keyOf('room-a'), detection: { mode: 'room-mask', roomId: 0x10, mask: 0x0010 } },
  { key: keyOf('ow-b'), detection: { mode: 'ow-mask', owScreen: 3, mask: 0x40 } },
  { key: keyOf('prog-c'), detection: { mode: 'progress', bufferIndex: 5, mask: 0x01 } },
  { key: keyOf('prog-d'), detection: { mode: 'progress', bufferIndex: 7, compare: 'gte', value: 3 } },
  { key: keyOf('chk-e'), checkId: 'chk-e' },
  { key: keyOf('base-f'), checkId: 'chk-f', baselineOnly: true },
  { key: keyOf('live-g'), detection: { mode: 'room-mask', roomId: 0x20, mask: 0x0200 } },
  { key: keyOf('late-h'), detection: { mode: 'room-mask', roomId: 0x30, mask: 0x0001 } },
];

const KNOWN_REPORTED = new Set<string>(['room-a']);

const ROOM_A_BYTE = ROOM_PTR + 0x10 * 2;
const ROOM_H_BYTE = ROOM_PTR + 0x30 * 2;

interface PollFrame {
  note: string;
  writes?: Array<[number, number]>;
  completed?: string[];
  roomTableMissing?: boolean;
  stateLoad?: { writes: Array<[number, number]>; completed: string[]; suppress: string[] };
}

const POLL_SETUP = {
  writes: [[ROOM_A_BYTE, 0x10]] as Array<[number, number]>,
  completed: ['chk-e'],
};

const POLL_FRAMES: PollFrame[] = [
  { note: 'first tick re-baselines' },
  { note: 'overworld screen 3 flag', writes: [[OW_PTR + 3, 0x40]] },
  { note: 'room table pointer missing', roomTableMissing: true, writes: [[PROG_PTR + 5, 0x01]] },
  { note: 'progress flag lands, live room word completes room 0x20', writes: [[LIVE_PTR, 0x20], [LIVE_PTR + 2, 0x00], [LIVE_PTR + 3, 0x02]] },
  { note: 'threshold short, baseline-only check completes', writes: [[PROG_PTR + 7, 2]], completed: ['chk-e', 'chk-f'] },
  { note: 'threshold met', writes: [[PROG_PTR + 7, 3]] },
  {
    note: 'state load: heap replaced, late-h suppressed, re-baseline requested',
    stateLoad: {
      writes: [[ROOM_A_BYTE, 0x10], [OW_PTR + 3, 0x40], [PROG_PTR + 5, 0x01], [ROOM_H_BYTE, 0x01]],
      completed: ['chk-e', 'chk-f'],
      suppress: ['late-h'],
    },
  },
  { note: 'first tick after the load re-baselines' },
  { note: 'threshold met again', writes: [[PROG_PTR + 7, 3]] },
  { note: 'idle' },
];

export { KNOWN_REPORTED, POLL_ENTRIES, POLL_FRAMES, POLL_SETUP };
export type { PollFrame };
