/* @layer site-kit @kind hook */
import { useCallback, useMemo } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import type { SideNavConfig, SideNavItem } from '@drizztdourden08/tessera/composites';
import { hasRight } from '@rotp/hub-contracts';
import type { Rights } from '@rotp/hub-contracts';
import { useSessionContext } from '../../../session/session-context';
import { useLocation } from '../../../hooks/useLocation';
import { useSiteDefinition } from '../../../site/site-context';
import type { SiteSection } from '../../../site/site-definition.type';
import { NavAvatar } from '../sub-components/NavAvatar';
import { ACCOUNT_SECTION, ROOT } from './useSiteNav.constants';
import type { NavPerson } from './useSiteNav.type';

const navItem = (section: SiteSection, person: NavPerson): SideNavItem => {
  const { id, label, icon } = section;
  if (id === ACCOUNT_SECTION && person) {
    return { id, label: person.displayName, icon: <NavAvatar src={person.avatarUrl} fallback={icon} /> };
  }
  return { id, label, icon: <IconifyIcon icon={icon} /> };
};

const isVisible = (section: SiteSection, isAdmin: boolean, rights: Rights | null) =>
  (!section.adminOnly || isAdmin) && (!section.permission || hasRight(rights, section.permission));

const useSiteNav = () => {
  const { sections, home, navGroups } = useSiteDefinition();
  const { me, access, rights } = useSessionContext();
  const { path, navigate } = useLocation();
  const isAdmin = access?.state === 'admin';
  const person = useMemo<NavPerson>(
    () => (me ? { displayName: me.displayName, avatarUrl: me.avatarUrl } : null),
    [me],
  );

  const config = useMemo<SideNavConfig>(() => ({
    home: navItem(sections[home], person),
    groups: navGroups.map((group) => ({
      id: group.id,
      label: group.label,
      items: group.sections
        .filter((id) => isVisible(sections[id], isAdmin, rights))
        .map((id) => navItem(sections[id], person)),
    })).filter((group) => group.items.length > 0),
  }), [sections, home, navGroups, isAdmin, rights, person]);

  const activeId = useMemo(() => {
    if (path === ROOT) return home;
    return Object.values(sections).find((section) => path.startsWith(section.path))?.id ?? home;
  }, [path, sections, home]);

  const select = useCallback((id: string) => {
    const section = sections[id];
    if (section) navigate(section.path);
  }, [sections, navigate]);

  return { config, activeId, select };
};

export { useSiteNav };
