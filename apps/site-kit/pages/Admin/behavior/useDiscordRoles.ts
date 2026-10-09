/* @layer site-kit @kind hook */
import { useEffect, useMemo, useState } from 'react';
import type { DiscordRole } from '@rotp/hub-contracts';
import { listDiscordRoles } from '@rotp/hub-client';
import type { DiscordRolesState } from './useDiscordRoles.type';

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
