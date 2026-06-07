/* @layer renderer-appshell @kind hook */
/** App-level overlay/dialog UI state: update dialog, about, sprite debug, shadow editor. */
import { useState, useCallback, useEffect } from 'react';
import { useShadowEditorStore } from '../../stores/shadow-editor-store';
import type { ConfirmDialog } from '../types';

interface AppOverlaysParams {
  showDialog: (config: ConfirmDialog) => void;
  dismissDialog: () => void;
}

const useAppOverlays = ({ showDialog, dismissDialog }: AppOverlaysParams) => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSpriteDebug, setShowSpriteDebug] = useState(false);
  const toggleSpriteDebug = useCallback(() => setShowSpriteDebug(v => !v), []);
  const [shadowEditorWarningShown, setShadowEditorWarningShown] = useState(
    () => localStorage.getItem('shadowEditor.warningDismissed') === 'true',
  );
  const handleShowShadowEditor = useCallback(() => {
    if (!shadowEditorWarningShown) {
      showDialog({
        title: 'Shadow Editor — Developer Tool',
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

  // Dev-only sprite debug toggle (Ctrl+Shift+D)
  useEffect(() => {
    if (!window.api.isDev) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') { e.preventDefault(); setShowSpriteDebug(v => !v); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return {
    showUpdateDialog, setShowUpdateDialog,
    showAbout, setShowAbout,
    showSpriteDebug, toggleSpriteDebug,
    handleShowShadowEditor,
  };
};

export { useAppOverlays };
