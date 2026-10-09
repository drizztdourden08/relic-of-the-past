/* @layer electron-main @kind constants */
import type { SaveKind } from '@shared/storage/save-paths';

const SAVE_KINDS: readonly SaveKind[] = ['quick', 'normal', 'auto'];

export { SAVE_KINDS };
