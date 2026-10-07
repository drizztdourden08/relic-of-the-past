/* @layer sanctuary-site @kind component */
/**
 * The Groups menu of one person in the admin queue: every group, ticked when the admin
 * put the person in it by hand. A click flips one group and sends the whole manual list.
 * A group the person holds through Discord is ticked and locked here, since only the
 * role decides it.
 */
import { useMemo } from 'react';
import type { SanctuaryUser } from '@shared/sanctuary/types';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { DropdownMenu } from '@ds/composites/DropdownMenu';
import type { MenuEntry } from '@ds/composites/DropdownMenu';
import { useAnchorMenu } from '@ds/composites/FilterBar/behavior/use-anchor-menu';
import type { GroupView } from '../../../api/types';

type MemberGroupsProps = {
  user: SanctuaryUser;
  groups: readonly GroupView[];
  busy: boolean;
  onChange: (userId: string, groupIds: string[]) => void;
};

/** The portalled menu, so a click inside it does not count as an outside click. */
const MENU_SELECTOR = '.dropdown-menu';

const flipped = (ids: readonly string[], id: string) =>
  (ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id]);

const MemberGroups = (props: MemberGroupsProps) => {
  const { user, groups, busy, onChange } = props;
  const menu = useAnchorMenu<HTMLButtonElement>(MENU_SELECTOR);

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
export type { MemberGroupsProps };
