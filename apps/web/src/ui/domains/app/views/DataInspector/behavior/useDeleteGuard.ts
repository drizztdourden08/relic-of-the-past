/* @layer renderer-app @kind logic */
/**
 * Ties the usage-overview panel and the delete confirmation together for one
 * open record. A referenced record's delete stops at a dialog naming what
 * points at it; an unreferenced one deletes at once, with no dialog.
 */
import { useCallback, useMemo, useState } from 'react';
import { recordDeleterFor } from './delete-record';
import { isReferenceGuarded, referencedByHitsFor } from './reference-usage';
import type { ReferencedByHit } from '@ds/composites/RecordEditor';

interface DeleteGuardDialogState {
  open: boolean;
  hits: readonly ReferencedByHit[];
  error?: string;
}

const CLOSED: DeleteGuardDialogState = { open: false, hits: [] };

/** The guard's whole rule as one pure decision, so a test pins the rule and not React's plumbing. */
type DeleteRoute =
  | { kind: 'immediate' }
  | { kind: 'confirm'; hits: readonly ReferencedByHit[] };

const routeDelete = (hits: readonly ReferencedByHit[]): DeleteRoute =>
  (hits.length === 0 ? { kind: 'immediate' } : { kind: 'confirm', hits });

const useDeleteGuard = (collectionKind: string, id: string | undefined, onDeleted: () => void) => {
  const [dialog, setDialog] = useState<DeleteGuardDialogState>(CLOSED);
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
    setDialog(CLOSED);
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

  const cancelDelete = useCallback(() => setDialog(CLOSED), []);

  return {
    /** Undefined when this collection has no delete write path, so the button is omitted. */
    onDelete: deleter ? requestDelete : undefined,
    referencedBy,
    dialogOpen: dialog.open,
    dialogHits: dialog.hits,
    dialogError: dialog.error,
    confirmDelete: runDelete,
    cancelDelete,
  };
};

export { routeDelete, useDeleteGuard };
export type { DeleteRoute };
