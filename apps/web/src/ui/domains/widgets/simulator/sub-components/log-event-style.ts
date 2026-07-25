/* @layer renderer-widgets @kind logic */
/**
 * Classifies a SimEvent into a display kind (colour + short tag) and computes
 * per-row indents. Hierarchy: "Sequence" + the final outcome at the base;
 * "Area" (big multi-sub-screen groups) one level in; "Screen"/"Exiting" markers
 * one under their area (or under the sequence outside areas); everything inside
 * a screen one deeper still.
 */
import type { SimEvent } from '@shared/game/simulation';

type LogKind = 'seq' | 'area' | 'screen' | 'pos' | 'backtrack' | 'flood' | 'reset' | 'check' | 'item' | 'move' | 'unlock' | 'outcome' | 'discover' | 'info' | 'debug';

interface LogStyle {
  kind: LogKind;
  tag: string;
}

const classifyEvent = (event: SimEvent): LogStyle => {
  const m = event.msg;
  // Order matters: specific prefixes before the broad flood match (so e.g.
  // "Unlock! re-flooding" is an UNLK, not a FLOOD).
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
  if (/^Got ["“]/.test(m)) return { kind: 'item', tag: 'ITEM' };
  if (/^Found |^discovered/.test(m)) return { kind: 'discover', tag: 'FIND' };
  if (/^Opening |^Talking to |^Triggering |^Defeating |^Bombing |^Unlocking |^Walking into |^Pulling |^Rescuing |^Bringing |^Verified/.test(m)) return { kind: 'check', tag: 'CHECK' };
  if (/^flood |reachable|\bedges\b|\bentrances\b/i.test(m)) return { kind: 'flood', tag: 'FLOOD' };
  if (event.level === 'debug') return { kind: 'debug', tag: 'DBG' };
  return { kind: 'info', tag: 'INFO' };
};

/**
 * Per-row indent levels for a whole event list. Stateful: "Area X" opens a big
 * multi-sub-screen group (its screens shift one deeper) until "Leaving area".
 */
const computeIndents = (events: SimEvent[]): number[] => {
  let inArea = false;
  return events.map((event) => {
    const { kind } = classifyEvent(event);
    if (kind === 'seq' || kind === 'outcome') return 0;
    if (kind === 'area') {
      inArea = !/^Leaving/.test(event.msg);
      return 1;
    }
    const screenLevel = inArea ? 2 : 1;
    return kind === 'screen' || kind === 'backtrack' ? screenLevel : screenLevel + 1;
  });
};

/** All kinds in display order, with human labels — drives the show/hide filter. */
const ALL_KINDS: LogKind[] = ['seq', 'area', 'screen', 'pos', 'backtrack', 'flood', 'reset', 'check', 'item', 'discover', 'move', 'unlock', 'outcome', 'info', 'debug'];

const KIND_LABEL: Record<LogKind, string> = {
  seq: 'Sequences',
  area: 'Areas',
  screen: 'Screens',
  pos: 'Positions',
  backtrack: 'Backtracks',
  flood: 'Flood',
  reset: 'Resets',
  check: 'Checks',
  item: 'Items',
  discover: 'Discoveries',
  move: 'Moves',
  unlock: 'Unlocks',
  outcome: 'Outcome',
  info: 'Info',
  debug: 'Debug',
};

/** Format events as plain text for clipboard copy: indent + TAG<tab>message. */
const eventsToText = (events: SimEvent[]): string => {
  const indents = computeIndents(events);
  return events.map((e, i) => {
    const { tag } = classifyEvent(e);
    return `${'  '.repeat(indents[i])}${tag.replace(/[▸◂§▣] /, '')}\t${e.msg}`;
  }).join('\n');
};

export { classifyEvent, computeIndents, ALL_KINDS, KIND_LABEL, eventsToText };
export type { LogKind, LogStyle };
