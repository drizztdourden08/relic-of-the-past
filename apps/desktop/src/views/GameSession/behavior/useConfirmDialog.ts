/* @layer renderer-appshell @kind hook */
import { useMemo } from 'react';
import { useDialogStore } from '@drizztdourden08/brock-react';
import type { ConfirmDialog } from '../GameSession.type';

const showDialog = (config: ConfirmDialog): void => {
  useDialogStore.getState().show(config);
};

const dismissDialog = (): void => {
  useDialogStore.getState().dismiss();
};

const handleDeleteConfirm = (title: string, message: string, onConfirm: () => void): void => {
  showDialog({
    title,
    message,
    confirmLabel: 'Delete',
    variant: 'danger',
    onConfirm: () => { dismissDialog(); onConfirm(); },
  });
};

const useConfirmDialog = () => useMemo(() => ({ showDialog, dismissDialog, handleDeleteConfirm }), []);

export { useConfirmDialog };
