/* @layer site-kit @kind types */
import type { DiscordRole } from '@shared/hub/group-types';

type RolePickerProps = {
  roles: readonly DiscordRole[];
  value: string;
  onChange: (roleId: string) => void;
};

export type { RolePickerProps };
