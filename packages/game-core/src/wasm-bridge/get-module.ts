/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../types';
import { bridgeState } from './bridge-state';

const getModule = (): EmscriptenModule | null => bridgeState.currentModule;

export { getModule };
