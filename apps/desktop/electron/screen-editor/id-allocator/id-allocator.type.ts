/* @layer electron-main @kind types */
import type { KIND_ROOTS } from './id-allocator.constants';

type AllocatableKind = keyof typeof KIND_ROOTS;

export type { AllocatableKind };
