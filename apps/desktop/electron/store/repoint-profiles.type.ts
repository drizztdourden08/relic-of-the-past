/* @layer electron-main @kind types */
import type { InstalledPack } from '@rotp/hub-contracts';

type SelectedPack = Pick<InstalledPack, 'kind' | 'installedName'>;

export type { SelectedPack };
