/* @layer renderer-app @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { CLOSED_DELETE_DIALOG } from '../../DataInspector.constants';
import type { DeleteGuardDialogState } from '../../DataInspector.type';
import { recordDeleterFor } from '../delete-record';
import { isReferenceGuarded, referencedByHitsFor } from '../reference-usage';
import { routeDelete } from './route-delete';

const useDeleteGuard = (collectionKind: string, id: string | undefined, onDeleted: () => void) => {
  const [dialog, setDialog] = useState<DeleteGuardDialogState>(CLOSED_DELETE_DIALOG);
  const deleter = recordDeleterFor(collectionKind);

  const referencedBy = useMemo(
    () => (id && isReferenceGuarded(collectionKind) ? referencedByHitsFor(collectionKind, id) : undefined),
    [collectionKind, id],
  );

  const runDelete = useCallback(async () => {
    if (!id || !deleter) return;
    const result = await deleter(id);
    if (!result.success) {
      setDialog(prev => ({ ...prev, open: true, error: result.error }));
      return;
    }
    setDialog(CLOSED_DELETE_DIALOG);
    onDeleted();
  }, [id, deleter, onDeleted]);

  const requestDelete = useCallback(() => {
    if (!id) return;
    const route = routeDelete(referencedByHitsFor(collectionKind, id));
    if (route.kind === 'immediate') {
      void runDelete();
      return;
    }
    setDialog({ open: true, hits: route.hits });
  }, [collectionKind, id, runDelete]);

  const cancelDelete = useCallback(() => setDialog(CLOSED_DELETE_DIALOG), []);

  return {
    onDelete: deleter ? requestDelete : undefined,
    referencedBy,
    dialogOpen: dialog.open,
    dialogHits: dialog.hits,
    dialogError: dialog.error,
    confirmDelete: runDelete,
    cancelDelete,
  };
};

export { useDeleteGuard };
