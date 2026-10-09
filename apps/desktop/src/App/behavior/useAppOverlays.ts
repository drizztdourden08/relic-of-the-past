/* @layer renderer-appshell @kind hook */
import { useState, useCallback } from 'react';
import { useShadowEditorStore } from '../../stores/shadow-editor-store';
import type { AppOverlaysParams } from './useAppOverlays.type';

const useAppOverlays = ({ showDialog, dismissDialog }: AppOverlaysParams) => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showBugReportDialog, setShowBugReportDialog] = useState(false);
  const [shadowEditorWarningShown, setShadowEditorWarningShown] = useState(
    () => localStorage.getItem('shadowEditor.warningDismissed') === 'true',
  );
  const handleShowShadowEditor = useCallback(() => {
    if (!shadowEditorWarningShown) {
      showDialog({
        title: 'Shadow Editor (Developer Tool)',
        message: 'This tool modifies shadow casting data that is committed directly to the project source code. Any changes you make here will affect the game\'s lighting for ALL builds.\n\nThis tool is only available in development mode.',
        confirmLabel: 'I understand, open editor',
        variant: 'default',
        onConfirm: () => {
          dismissDialog();
          localStorage.setItem('shadowEditor.warningDismissed', 'true');
          setShadowEditorWarningShown(true);
          useShadowEditorStore.getState().setOpen(true);
        },
      });
    } else {
      useShadowEditorStore.getState().setOpen(true);
    }
  }, [shadowEditorWarningShown, showDialog, dismissDialog]);

  return {
    showUpdateDialog, setShowUpdateDialog,
    showBugReportDialog, setShowBugReportDialog,
    handleShowShadowEditor,
  };
};

export { useAppOverlays };
