/* @layer site-kit @kind types */
import type { SiteUser } from '@shared/hub/site-types';
import type { GroupView } from '../../../api/hub-responses.type';

type MemberGroupsProps = {
  user: SiteUser;
  groups: readonly GroupView[];
  busy: boolean;
  onChange: (userId: string, groupIds: string[]) => void;
};

export type { MemberGroupsProps };
