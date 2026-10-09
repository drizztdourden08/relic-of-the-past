/* @layer bridge-wasm @kind logic */
import { performAutoSave } from './perform-auto-save';

const saveOnQuit = async (): Promise<boolean> => performAutoSave('quit');

export { saveOnQuit };
