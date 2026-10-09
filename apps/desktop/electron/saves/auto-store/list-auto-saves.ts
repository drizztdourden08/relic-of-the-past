/* @layer electron-main @kind logic */
import type { AutoSaveInfo } from '@shared/types/saves';
import { autoManifestStore } from './auto-manifest-store';

const listAutoSaves = (profileId: string): Promise<AutoSaveInfo[]> => autoManifestStore.list(profileId);

export { listAutoSaves };
