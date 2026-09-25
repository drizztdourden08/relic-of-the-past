/* @layer sanctuary-site @kind hook */
/**
 * The Discord server's roles, loaded once for the admin page. `available` is false when
 * the API has no bot to ask, and the editor then falls back to typing a role id.
 */
import { useEffect, useMemo, useState } from 'react';
import type { DiscordRole } from '@shared/sanctuary/group-types';
import { listDiscordRoles } from '../../../api/groups-endpoints';

type DiscordRolesState = {
  roles: DiscordRole[];
  available: boolean;
  loading: boolean;
  /** Role id to its role, for naming a linked role in the group list. */
  byId: ReadonlyMap<string, DiscordRole>;
};

const useDiscordRoles = (): DiscordRolesState => {
  const [roles, setRoles] = useState<DiscordRole[]>([]);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    listDiscordRoles()
      .then((answer) => {
        if (!live) return;
        setRoles(answer.roles);
        setAvailable(answer.available);
      })
      .catch(() => { if (live) setAvailable(false); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  const byId = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);
  return { roles, available, loading, byId };
};

export { useDiscordRoles };
export type { DiscordRolesState };
