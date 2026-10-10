/* @layer site-kit @kind hook */
import { createElement, useCallback, useMemo } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import type { SideNavConfig, SideNavItem } from '@drizztdourden08/tessera/composites';
import { hasRight } from '@rotp/hub-contracts';
import type { Rights } from '@rotp/hub-contracts';
import { useSessionContext } from '../../../session/session-context';
import { useLocation } from '../../../hooks/useLocation';
import { useSiteDefinition } from '../../../site/site-context';
import type { SiteSection } from '../../../site/site-definition.type';
import { ROOT_PATH } from '../SiteLayout.constants';
import { sectionOf } from './section-of';

const navItem = (section: SiteSection): SideNavItem => ({ id: section.id, label: section.label, icon: createElement(IconifyIcon, { icon: section.icon }) });

const isVisible = (section: SiteSection, isAdmin: boolean, rights: Rights | null) =>
  (!section.adminOnly || isAdmin) && (!section.permission || hasRight(rights, section.permission));

const useSiteNav = () => {
  const { sections, home, navGroups } = useSiteDefinition();
  const { access, rights } = useSessionContext();
  const { path, navigate } = useLocation();
  const isAdmin = access?.state === 'admin';

  const config = useMemo<SideNavConfig>(() => ({
    home: navItem(sectionOf(sections, home)),
    groups: navGroups.map((group) => ({
      id: group.id,
      label: group.label,
      items: group.sections.filter((id) => isVisible(sectionOf(sections, id), isAdmin, rights)).map((id) => navItem(sectionOf(sections, id))),
    })).filter((group) => group.items.length > 0),
  }), [sections, home, navGroups, isAdmin, rights]);

  const activeId = useMemo(() => {
    if (path === ROOT_PATH) return home;
    return Object.values(sections).find((section) => path.startsWith(section.path))?.id ?? home;
  }, [path, sections, home]);

  const select = useCallback((id: string) => navigate(sectionOf(sections, id).path), [sections, navigate]);

  return { config, activeId, select };
};

export { useSiteNav };
