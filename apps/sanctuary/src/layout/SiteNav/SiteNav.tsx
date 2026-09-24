/* @layer sanctuary-site @kind component */
/**
 * The left column: the brand, the app's SectionNav over the site's sections with the
 * site's search field, and the signed-in identity at the foot. The nav owns its
 * open/closed width; the brand and the identity read that width from their container and
 * show their text only when it fits. While the search is in use no section is current.
 */
import { useCallback } from 'react';
import { Stack } from '@ds/primitives/Stack';
import { SectionNav } from '@ds/composites/SectionNav';
import type { SectionNavSearch } from '@ds/composites/SectionNav';
import { useSiteNav } from './behavior/useSiteNav';
import './SiteNav.css';

type SiteNavProps = {
  search: SectionNavSearch;
  searching: boolean;
  /** Called before a nav item opens its section; the frame ends the search. */
  onNavigate: () => void;
};

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
export type { SiteNavProps };
