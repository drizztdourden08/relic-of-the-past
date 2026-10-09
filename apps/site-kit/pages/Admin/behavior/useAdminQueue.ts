/* @layer site-kit @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminUser } from '@rotp/hub-client';
import { listAdminQueue, setUserGroups, revokeAccess } from '@rotp/hub-client';
import { errorMessage } from '@rotp/hub-client';
import type { Grouped } from './useAdminQueue.type';

const emptyGroups = (): Grouped => ({ admin: [], member: [], pending: [], revoked: [] });

const useAdminQueue = () => {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { users: rows } = await listAdminQueue();
      setUsers(rows);
      setError(null);
    } catch (cause) {
      setError(errorMessage(cause));
      setUsers([]);
    }
  }, []);

  const act = useCallback(async (userId: string, action: (id: string) => Promise<unknown>) => {
    setBusyId(userId);
    setError(null);
    try {
      await action(userId);
      await load();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusyId(null);
    }
  }, [load]);

  const setGroups = useCallback(
    (userId: string, groupIds: string[]) => act(userId, (id) => setUserGroups(id, groupIds)),
    [act],
  );
  const revoke = useCallback((userId: string) => act(userId, (id) => revokeAccess(id)), [act]);

  const byState = useMemo(() => {
    const out = emptyGroups();
    for (const row of users ?? []) if (row.user.access) out[row.user.access.state].push(row);
    return out;
  }, [users]);

  return { loading: users === null, byState, busyId, error, setGroups, revoke };
};

export { useAdminQueue };
