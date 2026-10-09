/* @layer site-kit @kind types */
import type { GroupView } from '@rotp/hub-client';
import type { GroupsState } from '../behavior/useGroups.type';

type GroupsSectionProps = {
  state: GroupsState;
};

type Editing = { kind: 'new' } | { kind: 'edit'; group: GroupView } | null;

export type { GroupsSectionProps, Editing };
