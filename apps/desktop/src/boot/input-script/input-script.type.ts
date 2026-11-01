/* @layer renderer-app @kind types */
interface ScriptStep {
  mask: number;
  frames: number;
}

type InputScriptParse = { ok: true; steps: ScriptStep[] } | { ok: false; error: string };

type LoadedScript = { kind: 'absent' } | { kind: 'invalid' } | { kind: 'ready'; steps: ScriptStep[] };

export type { InputScriptParse, LoadedScript, ScriptStep };
