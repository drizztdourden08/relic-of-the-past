/* @layer renderer-app @kind types */
interface ScriptEvent {
  start: number;
  end: number;
  mask: number;
}

type EventParse = { ok: true; event: ScriptEvent } | { ok: false; error: string };

type ButtonKey = 'press' | 'hold';

export type { ButtonKey, EventParse, ScriptEvent };
