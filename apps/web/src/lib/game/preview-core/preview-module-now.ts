/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../types';
import { getModule } from '../wasm-bridge';
import { previewCoreState } from './preview-core-state';

const previewModuleNow = (): EmscriptenModule | null => getModule() ?? previewCoreState.standalone;

export { previewModuleNow };
