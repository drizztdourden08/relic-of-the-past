/* @layer renderer-widgets @kind constants */
import type { LogRule } from '../SimulatorWidget.type';

const CLASSIFY_RULES: readonly LogRule[] = [
  { pattern: /^Sequence /, style: { kind: 'seq', tag: '§ SEQ' } },
  { pattern: /^Area /, style: { kind: 'area', tag: '▣ AREA' } },
  { pattern: /^Leaving area /, style: { kind: 'area', tag: '▣ AREA' } },
  { pattern: /^Screen /, style: { kind: 'screen', tag: '▸ SCR' } },
  { pattern: /^Exiting /, style: { kind: 'screen', tag: '◂ SCR' } },
  { pattern: /^Backtrack /, style: { kind: 'backtrack', tag: 'BACKTRACK' } },
  { pattern: /^START at /, style: { kind: 'pos', tag: 'START' } },
  { pattern: /^END at /, style: { kind: 'pos', tag: 'END' } },
  { pattern: /^Run finished/, style: { kind: 'outcome', tag: 'DONE' } },
  { pattern: /^Reset/i, style: { kind: 'reset', tag: 'RESET' } },
  { pattern: /^Unlock|^Defeated |^Shutter door|^Pulled |^The follower is tagging along/, style: { kind: 'unlock', tag: 'UNLK' } },
  { pattern: /^Running |^→/, style: { kind: 'move', tag: 'MOVE' } },
  { pattern: /^Got "/, style: { kind: 'item', tag: 'ITEM' } },
  { pattern: /^Found |^discovered/, style: { kind: 'discover', tag: 'FIND' } },
  {
    pattern: /^Opening |^Talking to |^Triggering |^Defeating |^Bombing |^Unlocking |^Walking into |^Pulling |^Rescuing |^Bringing |^Verified/,
    style: { kind: 'check', tag: 'CHECK' },
  },
  { pattern: /^flood |reachable|\bedges\b|\bentrances\b/i, style: { kind: 'flood', tag: 'FLOOD' } },
];

export { CLASSIFY_RULES };
