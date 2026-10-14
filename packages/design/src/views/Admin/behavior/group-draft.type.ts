/* @layer site-kit @kind types */
import type { GroupRights } from '@rotp/hub-contracts';

type GroupDraft = {
  name: string;
  roleId: string;
  rights: GroupRights;
};

export type { GroupDraft };
