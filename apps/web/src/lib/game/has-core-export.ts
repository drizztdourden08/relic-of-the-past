/* @layer bridge-wasm @kind logic */
import { getModule } from './wasm-bridge';

const hasCoreExport = (name: string): boolean => {
  const mod = getModule() as unknown as Record<string, unknown> | null;
  return mod != null && typeof mod[`_${name}`] === 'function';
};

export { hasCoreExport };
