/* @layer sanctuary-site @kind hook */
/**
 * What the section nav shows and does: the config built from the session (Admin for
 * admins only), the active section read from the location, and a select that navigates.
 */
import { useCallback, useMemo } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import type { SectionNavConfig, SectionNavItem } from '@ds/composites/SectionNav';
import { useSessionContext } from '../../../session/session-context';
import { useLocation } from '../../../router/useLocation';
import { SITE_HOME, SITE_NAV_GROUPS, SITE_SECTIONS } from '../SiteNav.constants';
import { NavAvatar } from '../sub-components/NavAvatar';
import type { SiteSectionId } from '../SiteNav.constants';

const ROOT = '/';

type NavPerson = { displayName: string; avatarUrl: string | null } | null;

/** The account entry is the person: their avatar and name in place of the section's icon and label. */
const navItem = (id: SiteSectionId, person: NavPerson): SectionNavItem => {
  const { label, icon } = SITE_SECTIONS[id];
  if (id === 'account' && person) {
    return { id, label: person.displayName, icon: <NavAvatar src={person.avatarUrl} fallback={icon} /> };
  }
  return { id, label, icon: <IconifyIcon icon={icon} /> };
};

/** The root serves Files, so it counts as that section. */
const sectionForPath = (path: string): SiteSectionId => {
  if (path === ROOT) return SITE_HOME;
  const hit = Object.values(SITE_SECTIONS).find((section) => path.startsWith(section.path));
  return hit?.id ?? SITE_HOME;
};

const useSiteNav = () => {
  const { me, access } = useSessionContext();
  const { path, navigate } = useLocation();
  const isAdmin = access?.state === 'admin';
  const person = useMemo<NavPerson>(
    () => (me ? { displayName: me.displayName, avatarUrl: me.avatarUrl } : null),
    [me],
  );

  const config = useMemo<SectionNavConfig>(() => ({
    home: navItem(SITE_HOME, person),
    groups: SITE_NAV_GROUPS.map((group) => ({
      id: group.id,
      label: group.label,
      items: group.sections
        .filter((id) => !SITE_SECTIONS[id].adminOnly || isAdmin)
        .map((id) => navItem(id, person)),
    })),
  }), [isAdmin, person]);

  const activeId = sectionForPath(path);
  const select = useCallback((id: string) => {
    const section = SITE_SECTIONS[id as SiteSectionId];
    if (section) navigate(section.path);
  }, [navigate]);

  return { config, activeId, select };
};

export { useSiteNav };
