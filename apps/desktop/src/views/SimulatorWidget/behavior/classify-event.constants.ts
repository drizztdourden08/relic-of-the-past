/* @layer renderer-widgets @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { LogCode, LogRule, LogStyle } from '../SimulatorWidget.type';

const TAGS = {
  'seq': msg('views-simulator:log.tag.seq'),
  'area': msg('views-simulator:log.tag.area'),
  'screen': msg('views-simulator:log.tag.screen'),
  'screen.exit': msg('views-simulator:log.tag.screen.exit'),
  'backtrack': msg('views-simulator:log.tag.backtrack'),
  'start': msg('views-simulator:log.tag.start'),
  'end': msg('views-simulator:log.tag.end'),
  'done': msg('views-simulator:log.tag.done'),
  'reset': msg('views-simulator:log.tag.reset'),
  'unlock': msg('views-simulator:log.tag.unlock'),
  'move': msg('views-simulator:log.tag.move'),
  'item': msg('views-simulator:log.tag.item'),
  'find': msg('views-simulator:log.tag.find'),
  'check': msg('views-simulator:log.tag.check'),
  'flood': msg('views-simulator:log.tag.flood'),
  'debug': msg('views-simulator:log.tag.debug'),
  'info': msg('views-simulator:log.tag.info'),
} as const;

const CLASSIFY_RULES: readonly LogRule[] = [
  { pattern: /^Sequence /, style: { kind: 'seq', tag: TAGS['seq'] } },
  { pattern: /^Area /, style: { kind: 'area', tag: TAGS['area'] } },
  { pattern: /^Leaving area /, style: { kind: 'area', tag: TAGS['area'] } },
  { pattern: /^Screen /, style: { kind: 'screen', tag: TAGS['screen'] } },
  { pattern: /^Exiting /, style: { kind: 'screen', tag: TAGS['screen.exit'] } },
  { pattern: /^Backtrack /, style: { kind: 'backtrack', tag: TAGS['backtrack'] } },
  { pattern: /^START at /, style: { kind: 'pos', tag: TAGS['start'] } },
  { pattern: /^END at /, style: { kind: 'pos', tag: TAGS['end'] } },
  { pattern: /^Run finished/, style: { kind: 'outcome', tag: TAGS['done'] } },
  { pattern: /^Reset/i, style: { kind: 'reset', tag: TAGS['reset'] } },
  { pattern: /^Unlock|^Defeated |^Shutter door|^Pulled |^The follower is tagging along/, style: { kind: 'unlock', tag: TAGS['unlock'] } },
  { pattern: /^Running |^→/, style: { kind: 'move', tag: TAGS['move'] } },
  { pattern: /^Got "/, style: { kind: 'item', tag: TAGS['item'] } },
  { pattern: /^Found |^discovered/, style: { kind: 'discover', tag: TAGS['find'] } },
  {
    pattern: /^Opening |^Talking to |^Triggering |^Defeating |^Bombing |^Unlocking |^Walking into |^Pulling |^Rescuing |^Bringing |^Verified/,
    style: { kind: 'check', tag: TAGS['check'] },
  },
  { pattern: /^flood |reachable|\bedges\b|\bentrances\b/i, style: { kind: 'flood', tag: TAGS['flood'] } },
];

const CODE_STYLES: Record<LogCode, LogStyle> = {
  'run-config': { kind: 'info', tag: TAGS['info'] },
  sequence: { kind: 'seq', tag: TAGS['seq'] },
  area: { kind: 'area', tag: TAGS['area'] },
  screen: { kind: 'screen', tag: TAGS['screen'] },
  start: { kind: 'pos', tag: TAGS['start'] },
  flood: { kind: 'flood', tag: TAGS['flood'] },
  exits: { kind: 'info', tag: TAGS['info'] },
};

const DEBUG_STYLE: LogStyle = { kind: 'debug', tag: TAGS['debug'] };
const INFO_STYLE: LogStyle = { kind: 'info', tag: TAGS['info'] };

export { CLASSIFY_RULES, CODE_STYLES, DEBUG_STYLE, INFO_STYLE };
