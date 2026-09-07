/* @layer renderer-app @kind component */
/** Every app-level dialog/overlay that isn't part of the main content stack: the generic
 *  confirm dialog, the updater, the bug-report form, and the boot progress bar. Split out of
 *  AppMain so that component stays about composing the game view, not every dialog's props. */
import { Dialog } from '@ds/composites/Dialog';
import type { ConfirmDialog } from '@app/App/types';
import type { useAutoUpdate } from '@app/hooks/useAutoUpdate';
import { BootProgressBar } from '../../BootProgressBar';
import { UpdateDialog } from '../../../compounds/UpdateDialog';
import { BugReportDialog } from '../../BugReport';

interface AppDialogsProps {
  dialog: ConfirmDialog | null;
  dismissDialog: () => void;
  canUpdate: boolean;
  update: ReturnType<typeof useAutoUpdate>;
  showUpdateDialog: boolean;
  setShowUpdateDialog: (open: boolean) => void;
  showBugReportDialog: boolean;
  setShowBugReportDialog: (open: boolean) => void;
  debugReportId: string | null;
  setDebugReportId: (id: string | null) => void;
}

const AppDialogs = (props: AppDialogsProps) => {
  const {
    dialog, dismissDialog, canUpdate, update, showUpdateDialog, setShowUpdateDialog,
    showBugReportDialog, setShowBugReportDialog, debugReportId, setDebugReportId,
  } = props;

  return (
    <>
      <Dialog
        open={dialog != null}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        confirmLabel={dialog?.confirmLabel}
        variant={dialog?.variant}
        onConfirm={dialog?.onConfirm ?? (() => {})}
        onCancel={dismissDialog}
      />

      {canUpdate && (
        <UpdateDialog
          open={showUpdateDialog}
          state={update}
          canInstall={update.canInstall}
          onApply={update.apply}
          onOpenReleasePage={update.openReleasePage}
          onLoadVersions={update.loadVersions}
          onSetPrefs={update.setPrefs}
          onReportBug={() => { setShowUpdateDialog(false); setShowBugReportDialog(true); }}
          onClose={() => setShowUpdateDialog(false)}
        />
      )}

      <BugReportDialog
        open={showBugReportDialog}
        onClose={() => { setShowBugReportDialog(false); setDebugReportId(null); }}
        debugReportId={debugReportId}
      />

      <BootProgressBar />
    </>
  );
};

export { AppDialogs };
