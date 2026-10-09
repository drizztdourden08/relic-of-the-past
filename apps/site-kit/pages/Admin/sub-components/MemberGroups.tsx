/* @layer site-kit @kind component */
import { useMemo } from 'react';
import { DropdownMenu } from '@drizztdourden08/tessera/composites';
import type { MenuGroup } from '@drizztdourden08/tessera/composites';
import { GROUPS_TRIGGER } from './MemberGroups.constants';
import type { MemberGroupsProps } from './MemberGroups.type';

const flipped = (ids: readonly string[], id: string) =>
  (ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id]);

const MemberGroups = (props: MemberGroupsProps) => {
  const { user, groups, busy, onChange } = props;

  const menu = useMemo<MenuGroup[]>(() => [{
    id: 'groups',
    items: groups.map((group) => {
      const fromRole = user.roleGroupIds.includes(group.id);
      return {
        id: group.id,
        label: fromRole ? `${group.name} (Discord)` : group.name,
        kind: 'check' as const,
        checked: fromRole || user.groupIds.includes(group.id),
        disabled: busy || fromRole,
        onSelect: () => onChange(user.id, flipped(user.groupIds, group.id)),
      };
    }),
  }], [groups, user, busy, onChange]);

  return (
    <DropdownMenu
      trigger={GROUPS_TRIGGER}
      variant="secondary"
      size="sm"
      align="end"
      disabled={busy || groups.length === 0}
      groups={menu}
    />
  );
};

export { MemberGroups };
