/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../types';
import { bridgeState } from './bridge-state';

const setModule = (mod: EmscriptenModule | null): void => { bridgeState.currentModule = mod; };

export { setModule };
