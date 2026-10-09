/* @layer electron-main @kind logic */
import type { InstalledPack } from '@shared/store/installed-types';
import { foldCase } from './fold-case';
import { INSTALLED_ROOTS } from './installed-guard.constants';

const rootOf = (pack: InstalledPack): string => foldCase(INSTALLED_ROOTS[pack.kind](pack.installedName));

export { rootOf };
