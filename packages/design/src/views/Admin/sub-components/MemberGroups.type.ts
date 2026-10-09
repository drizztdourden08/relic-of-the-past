/* @layer site-kit @kind types */
import type { SiteUser } from '@rotp/hub-contracts';
import type { GroupView } from '@rotp/hub-client';

type MemberGroupsProps = {
  user: SiteUser;
  groups: readonly GroupView[];
  busy: boolean;
  onChange: (userId: string, groupIds: string[]) => void;
};

export type { MemberGroupsProps };
