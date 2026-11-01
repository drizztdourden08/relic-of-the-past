/* @layer electron-main @kind logic */
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { EventLogEntry } from '@app/ipc';
import { rotpAutomationFlags } from '../automation/rotp-automation-flags';
import { EVENT_LOG_FLAG } from './test-handlers.constants';

type AppendResult = { success: boolean; error?: string };

/** Appends one JSON line to the --event-log file; each call opens, writes and closes, so every line is on disk when it returns. */
const appendEventLog = (event: EventLogEntry): AppendResult => {
  const raw = rotpAutomationFlags.flagValue(EVENT_LOG_FLAG);
  if (raw === null) return { success: false, error: `${EVENT_LOG_FLAG} is not set` };
  if (typeof event !== 'object' || event === null || Array.isArray(event)) return { success: false, error: 'an event is a JSON object' };
  try {
    const path = resolve(raw);
    mkdirSync(dirname(path), { recursive: true });
    appendFileSync(path, `${JSON.stringify(event)}\n`, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

export { appendEventLog };
