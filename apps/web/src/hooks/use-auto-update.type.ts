/* @layer renderer-other @kind types */
import type { UpdateInfo, UpdaterPrefs, VersionOption } from '@shared/ipc/updater-contract';

interface UpdateState {
  status: 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';
  info: UpdateInfo | null;
  percent: number;
  error: string | null;
  versions: VersionOption[];
  prefs: UpdaterPrefs;
  currentVersion: string;
}

export type { UpdateState };
