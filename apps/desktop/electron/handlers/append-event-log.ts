/* @layer electron-main @kind logic */
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { rotpAutomationFlags } from '../automation/rotp-automation-flags';
import type { AppendResult } from './append-event-log.type';
import { EVENT_LOG_FLAG } from './test-handlers.constants';

const isJsonObject = (value: unknown): boolean => typeof value === 'object' && value !== null && !Array.isArray(value);

const appendEventLog = (event: unknown): AppendResult => {
  const raw = rotpAutomationFlags.flagValue(EVENT_LOG_FLAG);
  if (raw === null) return { success: false, error: `${EVENT_LOG_FLAG} is not set` };
  if (!isJsonObject(event)) return { success: false, error: 'an event is a JSON object' };
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
