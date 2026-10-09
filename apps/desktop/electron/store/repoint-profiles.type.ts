/* @layer electron-main @kind types */
import type { InstalledPack } from '@shared/store/installed-types';

type SelectedPack = Pick<InstalledPack, 'kind' | 'installedName'>;

export type { SelectedPack };
