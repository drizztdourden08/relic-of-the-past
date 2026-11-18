/* @layer renderer-appshell @kind hook */
import { useMemo } from 'react';
import { useDialogStore, useT } from '@drizztdourden08/brock-react';
import type { ConfirmDialog } from '../GameSession.type';

const showDialog = (config: ConfirmDialog): void => {
  useDialogStore.getState().show(config);
};

const dismissDialog = (): void => {
  useDialogStore.getState().dismiss();
};

const handleDeleteConfirm = (confirmLabel: string, title: string, message: string, onConfirm: () => void): void => {
  showDialog({
    title,
    message,
    confirmLabel,
    variant: 'danger',
    onConfirm: () => { dismissDialog(); onConfirm(); },
  });
};

const useConfirmDialog = () => {
  const t = useT();
  return useMemo(() => ({
    showDialog,
    dismissDialog,
    handleDeleteConfirm: (title: string, message: string, onConfirm: () => void): void =>
      handleDeleteConfirm(t('views-game-session:delete.confirm'), title, message, onConfirm),
  }), [t]);
};

export { useConfirmDialog };
