/* @layer site-kit @kind types */
import type { DiscordRole } from '@rotp/hub-contracts';

type RolePickerProps = {
  roles: readonly DiscordRole[];
  value: string;
  onChange: (roleId: string) => void;
};

export type { RolePickerProps };
