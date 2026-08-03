/* @layer renderer-components @kind barrel */
/**
 * Importing this barrel is what installs the nine built-in kits: each module
 * registers its tester, its table strategies and its UI half as a side effect,
 * so a consumer only ever calls `resolveFieldKit`.
 */
import './string-kit';
import './number-kit';
import './boolean-kit';
import './enum-kit';
import './id-ref-kit';
import './array-kit';
import './object-kit';
import './union-kit';
import './unknown-kit';

export { registerFieldKit, registeredKitKinds, resolveFieldKit } from './registry';
export type {
  CellRenderOptions, EditorControlProps, FieldTypeStrategy, FilterControlProps,
  IdRefOption, IdRefOptionResolver, NumberBounds,
} from './registry';
