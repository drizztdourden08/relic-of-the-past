/* @layer site-kit @kind hook */
import { useCallback, useEffect, useState } from 'react';
import type { CreateGroupBody } from '@rotp/hub-contracts';
import { createGroup, deleteGroup, listGroups, patchGroup } from '../../../api/groups-endpoints';
import { errorMessage } from '../../../api/api-error';
import type { GroupView } from '../../../api/hub-responses.type';

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

  const save = useCallback((id: string | null, body: CreateGroupBody) =>
    run(() => (id === null ? createGroup(body) : patchGroup(id, body))), [run]);

  const remove = useCallback((id: string) => run(() => deleteGroup(id)), [run]);

  return { groups: groups ?? [], loading: groups === null, busy, error, save, remove, reload: load };
};

export { useGroups };
