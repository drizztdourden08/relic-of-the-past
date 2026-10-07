/* @layer renderer-components @kind logic */
/**
 * Classifies a log-bus entry into a display kind + short tag, the same way the
 * simulation log classifies its events. Session lines are already prefixed and
 * structured ("[Local] Overrode ..."), so they carry real types, and flattening them
 * into one grey stream throws away the only structure the feed has.
 *
 * Level wins over content: an error stays an error whatever it says.
 */
import type { LogEntry } from '../../../../../../lib/log-bus';
import type { LogKindDef, LogRow } from '@ds/composites/LogPanel';

type ActivityKind =
  | 'session' | 'plan' | 'override' | 'deliver' | 'check' | 'receipt'
  | 'online' | 'ap' | 'info' | 'warn' | 'error';

/** Ordered: the first match wins, so specific prefixes come before broad ones. */
const RULES: readonly [RegExp, ActivityKind, string][] = [
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

const classifyEntry = (entry: LogEntry): { kind: ActivityKind; tag: string } => {
  if (entry.level === 'error' || entry.channel === 'error') return { kind: 'error', tag: 'ERROR' };
  if (entry.level === 'warn') return { kind: 'warn', tag: 'WARN' };
  for (const [pattern, kind, tag] of RULES) {
    if (pattern.test(entry.message)) return { kind, tag };
  }
  return { kind: 'info', tag: 'INFO' };
};

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

const formatTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString(undefined, { hour12: false });

/**
 * The session prefix is the tag's job, so it is stripped from the message,
 * repeating "[Local]" on every one of ~500 arm-time lines is pure noise.
 */
const stripPrefix = (message: string): string => message.replace(/^\[[^\]]+]\s*/, '');

const activityRowOf = (entry: LogEntry): LogRow => {
  const { kind, tag } = classifyEntry(entry);
  return {
    id: String(entry.id),
    gutter: formatTime(entry.timestamp),
    tag,
    kind,
    message: stripPrefix(entry.message),
  };
};

/** The rows as tab-separated text for the copy button, arrows dropped from the tags. */
const rowsToText = (rows: readonly LogRow[]): string =>
  rows.map((row) => `${row.gutter}\t${row.tag.replace(/[▸◂] /, '')}\t${row.message}`).join('\n');

export { ACTIVITY_KINDS, activityRowOf, classifyEntry, formatTime, rowsToText };
export type { ActivityKind };
