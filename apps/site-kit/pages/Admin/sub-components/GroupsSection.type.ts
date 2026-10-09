/* @layer site-kit @kind types */
import type { GroupView } from '../../../api/hub-responses.type';
import type { GroupsState } from '../behavior/useGroups.type';

type GroupsSectionProps = {
  state: GroupsState;
};

type Editing = { kind: 'new' } | { kind: 'edit'; group: GroupView } | null;

export type { GroupsSectionProps, Editing };
