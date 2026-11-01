/* @layer renderer-app @kind logic */
import { compileSteps } from './compile-steps';
import { MAX_SCRIPT_FRAMES } from './input-script.constants';
import type { InputScriptParse } from './input-script.type';
import { parseEvent } from './parse-event';
import type { ScriptEvent } from './parse-event';

const parseInputScript = (text: string): InputScriptParse => {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (error) {
    return { ok: false, error: `not valid JSON (${error instanceof Error ? error.message : String(error)})` };
  }
  if (!Array.isArray(json) || json.length === 0) return { ok: false, error: 'it must be a non-empty JSON array of events' };
  const events: ScriptEvent[] = [];
  for (const [index, raw] of json.entries()) {
    const parsed = parseEvent(raw, index);
    if (!parsed.ok) return parsed;
    events.push(parsed.event);
  }
  const steps = compileSteps(events);
  const total = steps.reduce((sum, step) => sum + step.frames, 0);
  if (total > MAX_SCRIPT_FRAMES) return { ok: false, error: `it runs ${total} frames, above the ${MAX_SCRIPT_FRAMES} cap` };
  return { ok: true, steps };
};

export { parseInputScript };
