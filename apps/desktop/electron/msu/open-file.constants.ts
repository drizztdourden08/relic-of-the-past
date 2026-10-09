/* @layer electron-main @kind constants */
import type { OpenedKind } from './open-file.type';

const EXTENSION_KINDS: Record<string, OpenedKind> = { '.msul': 'msul', '.rsp': 'rsp', '.rlang': 'rlang' };

export { EXTENSION_KINDS };
