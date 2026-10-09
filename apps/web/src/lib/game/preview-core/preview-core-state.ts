/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../types';

const previewCoreState = {
  standalone: null as EmscriptenModule | null,
  standaloneRom: null as string | null,
  booting: null as Promise<EmscriptenModule | null> | null,
};

export { previewCoreState };
