/* @layer site-kit @kind types */
import type { DiscordRole } from '@rotp/hub-contracts';

type GroupRoleFieldProps = {
  roles: readonly DiscordRole[];
  rolesAvailable: boolean;
  roleId: string;
  onChange: (roleId: string) => void;
};

export type { GroupRoleFieldProps };
