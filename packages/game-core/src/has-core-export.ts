/* @layer bridge-wasm @kind logic */
import { getModule } from './wasm-bridge';

const hasCoreExport = (name: string): boolean => {
  const mod = getModule();
  return mod !== null && typeof Reflect.get(mod, `_${name}`) === 'function';
};

export { hasCoreExport };
