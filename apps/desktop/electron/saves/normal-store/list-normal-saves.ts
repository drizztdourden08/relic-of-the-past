/* @layer electron-main @kind logic */
import type { NormalSaveInfo } from '@shared/types/saves';
import { normalManifestStore } from './normal-manifest-store';

const listNormalSaves = (profileId: string): Promise<NormalSaveInfo[]> => normalManifestStore.list(profileId);

export { listNormalSaves };
