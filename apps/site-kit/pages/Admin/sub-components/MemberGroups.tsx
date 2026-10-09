/* @layer site-kit @kind component */
import { useMemo } from 'react';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { DropdownMenu } from '@ds/composites/DropdownMenu';
import type { MenuEntry } from '@ds/composites/DropdownMenu';
import { useAnchorMenu } from '@ds/composites/FilterBar/behavior/use-anchor-menu';
import { PORTALLED_MENU_SELECTOR } from './MemberGroups.constants';
import type { MemberGroupsProps } from './MemberGroups.type';

const flipped = (ids: readonly string[], id: string) =>
  (ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id]);

const MemberGroups = (props: MemberGroupsProps) => {
  const { user, groups, busy, onChange } = props;
  const menu = useAnchorMenu<HTMLButtonElement>(PORTALLED_MENU_SELECTOR);

  const items = useMemo<MenuEntry[]>(() => groups.map((group) => {
    const fromRole = user.roleGroupIds.includes(group.id);
    return {
      key: group.id,
      label: fromRole ? `${group.name} (Discord)` : group.name,
      checked: fromRole || user.groupIds.includes(group.id),
      disabled: busy || fromRole,
      onClick: () => onChange(user.id, flipped(user.groupIds, group.id)),
    };
  }), [groups, user, busy, onChange]);

  return (
    <>
      <Button ref={menu.anchorRef} variant="secondary" size="sm" disabled={busy || groups.length === 0} onClick={menu.toggle}>
        Groups <Text as="span" aria-hidden="true">{'▾'}</Text>
      </Button>
      {menu.open && <DropdownMenu items={items} anchorRef={menu.anchorRef} align="end" />}
    </>
  );
};

export { MemberGroups };
