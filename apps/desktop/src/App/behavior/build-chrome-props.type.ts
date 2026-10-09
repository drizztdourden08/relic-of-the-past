/* @layer renderer-appshell @kind types */
import type { TitleBarProps } from '../../ui/domains/app/views/TitleBar/TitleBar.type';
import type { ProfileHubTab } from '../../ui/domains/app/views/ProfileHub/ProfileHub.type';
import type { PageId } from '../App.type';

interface ChromePropsDeps {
  profileMgmt: { handleImportRom: () => void; activeProfile: TitleBarProps['activeProfile'] };
  widgets: { toggle: (id: string) => void };
  saveOverlay: { toggle: () => void };
  nav: { setActivePage: (page: PageId) => void };
  game: { isRunning: boolean };
  display: { windowMode: TitleBarProps['windowMode']; showFps: boolean };
  audio: { isMuted: boolean; handleToggleMute: () => void };
  widgetVisibility: Record<string, boolean>;
  developerToolsEnabled: boolean;
  handleShowProfile: (tab?: ProfileHubTab) => void | Promise<void>;
  handleShowDataManager: (tab?: string) => void | Promise<void>;
  handleShowShadowEditor: () => void;
  canUpdate: boolean;
  update: { supported: boolean; status: string; check: () => void };
  setShowUpdateDialog: (open: boolean) => void;
  setShowBugReportDialog: (open: boolean) => void;
}

export type { ChromePropsDeps };
