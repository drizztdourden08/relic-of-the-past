/* @layer electron-main @kind constants */
import type { StoreKind } from '@shared/store/types';

const INSTALLED_ROOTS: Record<StoreKind, (name: string) => string> = {
  music: (name) => `msu/${name}`,
  language: (name) => `languages/${name}`,
  character: (name) => `link-sprites/${name}`,
};

const GUARDED_TOP = new Set(['msu', 'languages', 'link-sprites']);

export { INSTALLED_ROOTS, GUARDED_TOP };
