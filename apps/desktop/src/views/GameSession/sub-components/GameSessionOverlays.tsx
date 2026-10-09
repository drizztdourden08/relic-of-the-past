/* @layer renderer-app @kind component */
import { useEffect } from 'react';
import { useCapability } from '@drizztdourden08/brock-react';
import { UpdateDialog } from '@app/ui/domains/app/compounds/UpdateDialog';
import { useAutoUpdate } from '@app/hooks/useAutoUpdate';
import { useUpdaterUiStore } from '@app/stores/updater-ui-store';
import { useSanctuaryBugReport } from '@app/hooks/useSanctuaryBugReport';

const GameSessionOverlays = () => {
  useSanctuaryBugReport();
  const canUpdate = useCapability('selfUpdate');
  const update = useAutoUpdate();
  const dialogOpen = useUpdaterUiStore((s) => s.dialogOpen);
  const setDialogOpen = useUpdaterUiStore((s) => s.setDialogOpen);
  const report = useUpdaterUiStore((s) => s.report);
  const { status, supported, check } = update;

  useEffect(() => {
    report({ available: canUpdate && supported && status === 'available', supported: canUpdate && supported, check });
  }, [canUpdate, supported, status, check, report]);

  if (!canUpdate) return null;
  return (
    <UpdateDialog
      open={dialogOpen}
      state={update}
      canInstall={update.canInstall}
      onApply={update.apply}
      onOpenReleasePage={update.openReleasePage}
      onLoadVersions={update.loadVersions}
      onSetPrefs={update.setPrefs}
      onReportBug={() => setDialogOpen(false)}
      onClose={() => setDialogOpen(false)}
    />
  );
};

export { GameSessionOverlays };
