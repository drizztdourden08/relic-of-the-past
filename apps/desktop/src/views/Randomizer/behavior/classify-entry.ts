/* @layer renderer-components @kind logic */
import type { LogEntry } from '../../../log-bus';
import { ACTIVITY_RULES } from './randomizer-log-style.constants';
import type { ActivityClass } from './randomizer-log-style.type';

const classifyEntry = (entry: LogEntry): ActivityClass => {
  if (entry.level === 'error' || entry.channel === 'error') return { kind: 'error', tag: 'ERROR' };
  if (entry.level === 'warn') return { kind: 'warn', tag: 'WARN' };
  for (const [pattern, kind, tag] of ACTIVITY_RULES) {
    if (pattern.test(entry.message)) return { kind, tag };
  }
  return { kind: 'info', tag: 'INFO' };
};

export { classifyEntry };
