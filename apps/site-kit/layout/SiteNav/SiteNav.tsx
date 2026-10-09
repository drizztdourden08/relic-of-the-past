/* @layer site-kit @kind component */
import { useCallback } from 'react';
import { Stack } from '@ds/primitives/Stack';
import { SectionNav } from '@ds/composites/SectionNav';
import { useSiteNav } from './behavior/useSiteNav';
import type { SiteNavProps } from './SiteNav.type';
import './SiteNav.css';

const SiteNav = (props: SiteNavProps) => {
  const { search, searching, onNavigate } = props;
  const { config, activeId, select } = useSiteNav();
  const handleSelect = useCallback((id: string) => {
    onNavigate();
    select(id);
  }, [onNavigate, select]);
  return (
    <Stack gap="sm" align="stretch" className="site-nav">
      <SectionNav
        className="site-nav__sections"
        config={config}
        activeId={searching ? '' : activeId}
        onSelect={handleSelect}
        search={search}
      />
    </Stack>
  );
};

export { SiteNav };
