/* @layer renderer-appshell @kind types */
import type { ConfirmDialog } from '../App.type';
import type { useGameLifecycle } from './useGameLifecycle';
import type { useProfileManagement } from './useProfileManagement';
import type { useAppNavigation } from './useAppNavigation';

interface AppViewCallbacksParams {
  game: ReturnType<typeof useGameLifecycle>;
  showDialog: (config: ConfirmDialog) => void;
  dismissDialog: () => void;
  profileMgmt: ReturnType<typeof useProfileManagement>;
  nav: ReturnType<typeof useAppNavigation>;
}

export type { AppViewCallbacksParams };
