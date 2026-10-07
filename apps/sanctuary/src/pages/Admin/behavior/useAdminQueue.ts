/* @layer sanctuary-site @kind hook */
/**
 * The admin queue: every user, split by access state, with their manual groups and
 * Revoke. Setting groups sends the person's whole manual list and reloads, since the
 * API may move them between states. Ignore on a pending user is a revoke: the row leaves
 * the queue and the user stays out of the content until an admin gives them a group.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AccessState } from '@shared/sanctuary/types';
import type { AdminUser } from '../../../api/types';
import { listAdminQueue, setUserGroups, revokeAccess } from '../../../api/endpoints';
import { errorMessage } from '../../../api/client';

type Grouped = Record<AccessState, AdminUser[]>;

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
    for (const row of users ?? []) out[row.user.access.state].push(row);
    return out;
  }, [users]);

  return { loading: users === null, byState, busyId, error, setGroups, revoke };
};

export { useAdminQueue };
