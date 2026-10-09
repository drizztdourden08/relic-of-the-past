/* @layer renderer-app @kind types */
import type { ConfirmDialog } from '@app/App/types';
import type { useAudioSettings } from '@app/App/behavior/useAudioSettings';
import type { useDisplaySettings } from '@app/App/behavior/useDisplaySettings';
import type { useGameLifecycle } from '@app/App/behavior/useGameLifecycle';
import type { useProfileManagement } from '@app/App/behavior/useProfileManagement';
import type { useSaveStateSettings } from '@app/App/behavior/useSaveStateSettings';
import type { useAutoUpdate } from '@app/hooks/useAutoUpdate';

type LoadedProfile = Parameters<Parameters<typeof useProfileManagement>[0]['onProfileLoaded']>[0];

interface LoadedProfileTargets {
  game: ReturnType<typeof useGameLifecycle>;
  display: ReturnType<typeof useDisplaySettings>;
  audio: ReturnType<typeof useAudioSettings>;
  saveState: ReturnType<typeof useSaveStateSettings>;
}

interface AppDialogsProps {
  dialog: ConfirmDialog | null;
  dismissDialog: () => void;
  canUpdate: boolean;
  update: ReturnType<typeof useAutoUpdate>;
  showUpdateDialog: boolean;
  setShowUpdateDialog: (open: boolean) => void;
  showBugReportDialog: boolean;
  setShowBugReportDialog: (open: boolean) => void;
  profileId: string | null;
}

export type { AppDialogsProps, LoadedProfile, LoadedProfileTargets };
