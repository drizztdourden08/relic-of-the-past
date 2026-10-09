/* @layer renderer-app @kind component */
import { Dialog } from '@drizztdourden08/tessera/composites';
import { BootProgressBar } from '../../BootProgressBar';
import { UpdateDialog } from '../../../compounds/UpdateDialog';
import { BugReportDialog } from '../../BugReport';
import type { AppDialogsProps } from '../AppMain.type';

const AppDialogs = (props: AppDialogsProps) => {
  const {
    dialog, dismissDialog, canUpdate, update, showUpdateDialog, setShowUpdateDialog,
    showBugReportDialog, setShowBugReportDialog, profileId,
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
        onClose={() => setShowBugReportDialog(false)}
        profileId={profileId}
      />

      <BootProgressBar />
    </>
  );
};

export { AppDialogs };
