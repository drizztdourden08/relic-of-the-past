/* @layer renderer-components @kind types */
import type { InstallProgress } from '@shared/store/install/installer.type';
import type { InstalledPack } from '@shared/store/installed-types';
import type { ItemCardView } from '@shared/store/home-types';

/** The Hookshop's side nav: Home, Browse, the three kinds, then what is installed. */
type StoreSection = 'home' | 'browse' | 'music' | 'character' | 'language' | 'installed' | 'updates';

interface StoreProps {
  /** An install or uninstall changed what profiles can select, so the shell's lists refresh. */
  onLibraryChanged: () => unknown;
  /** The shell's confirm dialog, the one the Data Manager asks with before deleting. */
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

/** One running or failed install, keyed by item in the install hook. */
interface InstallJob {
  running: boolean;
  /** null until the first report, and while the API grants the download. */
  progress: InstallProgress | null;
  error: string | null;
}

/** An installed pack beside its catalogue card, when the catalogue still lists it. */
interface InstalledRow {
  pack: InstalledPack;
  item: ItemCardView | null;
  /** The catalogue's live version differs from the installed one. */
  hasUpdate: boolean;
}

export type { StoreSection, StoreProps, InstallJob, InstalledRow };
