/* @layer renderer-widgets @kind logic */
import type { SimEvent } from '@rotp/navigation';
import type { LogStyle } from '../../SimulatorWidget.type';

const classifyEvent = (event: SimEvent): LogStyle => {
  const m = event.msg;
  if (/^Sequence /.test(m)) return { kind: 'seq', tag: '§ SEQ' };
  if (/^Area /.test(m)) return { kind: 'area', tag: '▣ AREA' };
  if (/^Leaving area /.test(m)) return { kind: 'area', tag: '▣ AREA' };
  if (/^Screen /.test(m)) return { kind: 'screen', tag: '▸ SCR' };
  if (/^Exiting /.test(m)) return { kind: 'screen', tag: '◂ SCR' };
  if (/^Backtrack /.test(m)) return { kind: 'backtrack', tag: 'BACKTRACK' };
  if (/^START at /.test(m)) return { kind: 'pos', tag: 'START' };
  if (/^END at /.test(m)) return { kind: 'pos', tag: 'END' };
  if (/^Run finished/.test(m)) return { kind: 'outcome', tag: 'DONE' };
  if (/^Reset/i.test(m)) return { kind: 'reset', tag: 'RESET' };
  if (/^Unlock|^Defeated |^Shutter door|^Pulled |^The follower is tagging along/.test(m)) return { kind: 'unlock', tag: 'UNLK' };
  if (/^Running |^→/.test(m)) return { kind: 'move', tag: 'MOVE' };
  if (/^Got "/.test(m)) return { kind: 'item', tag: 'ITEM' };
  if (/^Found |^discovered/.test(m)) return { kind: 'discover', tag: 'FIND' };
  if (/^Opening |^Talking to |^Triggering |^Defeating |^Bombing |^Unlocking |^Walking into |^Pulling |^Rescuing |^Bringing |^Verified/.test(m)) return { kind: 'check', tag: 'CHECK' };
  if (/^flood |reachable|\bedges\b|\bentrances\b/i.test(m)) return { kind: 'flood', tag: 'FLOOD' };
  if (event.level === 'debug') return { kind: 'debug', tag: 'DBG' };
  return { kind: 'info', tag: 'INFO' };
};

export { classifyEvent };
