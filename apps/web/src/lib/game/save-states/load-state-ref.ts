/* @layer bridge-wasm @kind logic */
import { loadState } from './load-state';
import { loadNamedState } from './load-named-state';

const loadStateRef = (ref: number | string): Promise<boolean> =>
  typeof ref === 'number' ? loadState(ref) : loadNamedState(ref);

export { loadStateRef };
