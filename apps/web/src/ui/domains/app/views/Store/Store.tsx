/* @layer renderer-components @kind component */
/**
 * The Hookshop tab: browse, install, update and uninstall packs from the community store.
 * Publishing, ratings and profiles live on the site. Built like the Data Manager: its side
 * nav, then the page for the selected section.
 */
import { useCallback } from 'react';
import { Box } from '@ds/primitives';
import { SectionNav } from '@ds/composites/SectionNav';
import { STORE_NAV } from './behavior/store-nav';
import { useStore } from './behavior/useStore';
import { StoreSectionContent } from './sub-components/StoreSectionContent';
import type { StoreProps, StoreSection } from './Store.type';
import './Store.css';

const Store = (props: StoreProps) => {
  const store = useStore(props);
  const { section, setSection } = store;
  const handleSelect = useCallback((id: string) => setSection(id as StoreSection), [setSection]);

  return (
    <Box className="store">
      <Box className="store__body">
        <SectionNav config={STORE_NAV} activeId={section} onSelect={handleSelect} />
        <Box className="store__content">
          <StoreSectionContent store={store} />
        </Box>
      </Box>
    </Box>
  );
};

export { Store };
