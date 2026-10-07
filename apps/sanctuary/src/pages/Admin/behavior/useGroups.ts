/* @layer sanctuary-site @kind hook */
/**
 * The admin's groups: loaded on mount with their member counts, then create, patch and
 * delete. A write reloads the list, since the counts are the API's to compute. `save`
 * resolves true on success so the editor knows to close.
 */
import { useCallback, useEffect, useState } from 'react';
import type { CreateGroupBody } from '@shared/sanctuary/schemas/group-schemas';
import { createGroup, deleteGroup, listGroups, patchGroup } from '../../../api/groups-endpoints';
import { errorMessage } from '../../../api/client';
import type { GroupView } from '../../../api/types';

const useGroups = () => {
  const [groups, setGroups] = useState<GroupView[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { groups: rows } = await listGroups();
      setGroups([...rows].sort((a, b) => a.createdAt - b.createdAt));
      setError(null);
    } catch (cause) {
      setError(errorMessage(cause));
      setGroups([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const run = useCallback(async (work: () => Promise<unknown>): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      await work();
      await load();
      return true;
    } catch (cause) {
      setError(errorMessage(cause));
      return false;
    } finally {
      setBusy(false);
    }
  }, [load]);

  /** A new group when `id` is null, otherwise the whole body as a patch of that one. */
  const save = useCallback((id: string | null, body: CreateGroupBody) =>
    run(() => (id === null ? createGroup(body) : patchGroup(id, body))), [run]);

  const remove = useCallback((id: string) => run(() => deleteGroup(id)), [run]);

  return { groups: groups ?? [], loading: groups === null, busy, error, save, remove, reload: load };
};

type GroupsState = ReturnType<typeof useGroups>;

export { useGroups };
export type { GroupsState };
