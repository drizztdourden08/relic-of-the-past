/* @layer site-kit @kind hook */
/**
 * What the section nav shows and does: the config built from the site's sections and the
 * session (an admin-only section for admins only, a section needing a permission for its
 * holders only), the active section read from the location, and a select that navigates.
 */
import { useCallback, useMemo } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import type { SectionNavConfig, SectionNavItem } from '@ds/composites/SectionNav';
import { hasRight } from '@shared/hub/rights';
import type { Rights } from '@shared/hub/group-types';
import { useSessionContext } from '../../../session/session-context';
import { useLocation } from '../../../router/useLocation';
import { useSiteDefinition } from '../../../site/site-context';
import type { SiteSection } from '../../../site/site-definition.type';
import { NavAvatar } from '../sub-components/NavAvatar';

const ROOT = '/';
/** The kit's Account page: the nav draws it as the signed-in person. */
const ACCOUNT_SECTION = 'account';

type NavPerson = { displayName: string; avatarUrl: string | null } | null;

/** The account entry is the person: their avatar and name in place of the section's icon and label. */
const navItem = (section: SiteSection, person: NavPerson): SectionNavItem => {
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

  const config = useMemo<SectionNavConfig>(() => ({
    home: navItem(sections[home], person),
    groups: navGroups.map((group) => ({
      id: group.id,
      label: group.label,
      items: group.sections
        .filter((id) => isVisible(sections[id], isAdmin, rights))
        .map((id) => navItem(sections[id], person)),
    })).filter((group) => group.items.length > 0),
  }), [sections, home, navGroups, isAdmin, rights, person]);

  /** The root serves the home section, so it counts as that section. */
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
