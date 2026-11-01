/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { log } from '@app/log-bus';
import type { LoadedScript } from './input-script.type';
import { parseInputScript } from './parse-input-script';

const loadInputScript = async (): Promise<LoadedScript> => {
  const { inputScript } = await requireHostApi().getTestArgs();
  if (inputScript === null) return { kind: 'absent' };
  if (inputScript.text === null) {
    log.app(`--input-script ${inputScript.path} could not be read: ${inputScript.error ?? 'unknown error'}`, 'error');
    return { kind: 'invalid' };
  }
  const parsed = parseInputScript(inputScript.text);
  if (parsed.ok) return { kind: 'ready', steps: parsed.steps };
  log.app(`--input-script ${inputScript.path} refused: ${parsed.error}`, 'error');
  return { kind: 'invalid' };
};

export { loadInputScript };
