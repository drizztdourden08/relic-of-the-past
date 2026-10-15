/* @layer renderer-components @kind constants */
import type { LogKindDef } from '@drizztdourden08/tessera/composites';
import type { ActivityKind } from './randomizer-log-style.type';

const ACTIVITY_RULES: readonly [RegExp, ActivityKind, string][] = [
  [/Starting session/, 'session', '▸ START'],
  [/Session armed/, 'session', '▸ ARMED'],
  [/Session stopped|Session refused/, 'session', '◂ STOP'],
  [/^\[[^\]]+] Plan|plan errors|Plan summary|locations planned/i, 'plan', 'PLAN'],
  [/Overrode "/, 'override', 'OVRD'],
  [/delivering "|Delivery |Delivered /, 'deliver', 'DELIV'],
  [/Check completed/, 'check', 'CHECK'],
  [/Receipt text|receipt gates|message lines/i, 'receipt', 'RCPT'],
  [/Connected|Disconnected|socket|slot |server/i, 'online', 'NET'],
  [/Placement generated|Generation failed/, 'plan', 'GEN'],
];

const ACTIVITY_KINDS: LogKindDef[] = [
  { id: 'session', label: 'Session', tone: 'primary', toneMessage: true, strong: true },
  { id: 'plan', label: 'Plan', tone: 'info', toneMessage: true },
  { id: 'override', label: 'Overrides', tone: 'dim', toneMessage: true },
  { id: 'deliver', label: 'Deliveries', tone: 'primary', toneMessage: true },
  { id: 'check', label: 'Checks', tone: 'secondary' },
  { id: 'receipt', label: 'Receipts', tone: 'dim', toneMessage: true },
  { id: 'online', label: 'Connection', tone: 'info' },
  { id: 'ap', label: 'Archipelago', tone: 'primary' },
  { id: 'info', label: 'Info', tone: 'muted' },
  { id: 'warn', label: 'Warnings', tone: 'warning', toneMessage: true },
  { id: 'error', label: 'Errors', tone: 'danger', toneMessage: true },
];

const SESSION_PREFIX = /^\[[^\]]+]\s*/;
const TAG_ARROW = /[▸◂] /;

export { ACTIVITY_RULES, ACTIVITY_KINDS, SESSION_PREFIX, TAG_ARROW };
