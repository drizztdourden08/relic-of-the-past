/* @layer renderer-components @kind constants */
import type { LogKindDef } from '@ds/composites/LogPanel';
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
  { id: 'session', label: 'Session' },
  { id: 'plan', label: 'Plan' },
  { id: 'override', label: 'Overrides' },
  { id: 'deliver', label: 'Deliveries' },
  { id: 'check', label: 'Checks' },
  { id: 'receipt', label: 'Receipts' },
  { id: 'online', label: 'Connection' },
  { id: 'ap', label: 'Archipelago' },
  { id: 'info', label: 'Info' },
  { id: 'warn', label: 'Warnings' },
  { id: 'error', label: 'Errors' },
];

const SESSION_PREFIX = /^\[[^\]]+]\s*/;
const TAG_ARROW = /[▸◂] /;

export { ACTIVITY_RULES, ACTIVITY_KINDS, SESSION_PREFIX, TAG_ARROW };
