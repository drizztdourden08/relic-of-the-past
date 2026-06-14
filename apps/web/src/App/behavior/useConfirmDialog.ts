/* @layer renderer-appshell @kind hook */
import { useState, useCallback } from 'react';
import type { ConfirmDialog } from '../types';

const useConfirmDialog = () => {
  const [dialog, setDialog] = useState<ConfirmDialog | null>(null);

  const showDialog = useCallback((config: ConfirmDialog) => {
    setDialog(config);
  }, []);

  const dismissDialog = useCallback(() => {
    setDialog(null);
  }, []);

  const handleDeleteConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    setDialog({
      title,
      message,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: () => { setDialog(null); onConfirm(); },
    });
  }, []);

  return {
    dialog,
    showDialog,
    dismissDialog,
    handleDeleteConfirm,
  };
};

export { useConfirmDialog };
