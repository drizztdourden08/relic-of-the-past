/* @layer renderer-app @kind types */
interface ScriptStep {
  mask: number;
  frames: number;
}

type InputScriptParse = { ok: true; steps: ScriptStep[] } | { ok: false; error: string };

export type { InputScriptParse, ScriptStep };
