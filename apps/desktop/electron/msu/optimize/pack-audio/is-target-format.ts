/* @layer electron-main @kind logic */
import { OPTIMIZE_TARGET_EXTENSION } from '@shared/types/msu-optimize';
import { extensionOf } from '../extension-of';

const isTargetFormat = (name: string): boolean => extensionOf(name) === OPTIMIZE_TARGET_EXTENSION;

export { isTargetFormat };
