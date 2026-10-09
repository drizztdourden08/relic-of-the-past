/* @layer shared-storage @kind logic */
import { OPTIMIZE_TARGET_EXTENSION } from '../optimize';
import { extensionOf } from './extension-of';

const isTargetFormat = (name: string): boolean => extensionOf(name) === OPTIMIZE_TARGET_EXTENSION;

export { isTargetFormat };
