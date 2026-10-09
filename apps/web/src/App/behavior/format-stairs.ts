/* @layer renderer-appshell @kind logic */
import type { StairInfo } from './dump-nav.type';

const formatStairs = (stairs: Array<{ destRoom: number; row: number; col: number }>): StairInfo[] =>
  stairs.map((s, i) => ({
    index: i,
    destRoom: s.destRoom,
    row: s.row,
    col: s.col,
    destRoomHex: `0x${s.destRoom.toString(16).padStart(4, '0')}`,
  })).filter(s => s.destRoom !== 0);

export { formatStairs };
