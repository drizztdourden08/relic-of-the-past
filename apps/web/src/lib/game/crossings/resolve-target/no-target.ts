/* @layer bridge-wasm @kind logic */
import type { ResolvedTarget } from './resolve-target.type';

const noTarget = (label: string): ResolvedTarget => ({ target: { screenId: null, native: null }, label });

export { noTarget };
