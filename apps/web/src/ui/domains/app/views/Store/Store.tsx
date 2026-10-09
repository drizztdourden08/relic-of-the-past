/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { SideNav } from '@drizztdourden08/tessera/composites';
import { STORE_NAV } from './Store.constants';
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
        <SideNav config={STORE_NAV} activeId={section} onSelect={handleSelect} />
        <Box className="store__content">
          <StoreSectionContent store={store} />
        </Box>
      </Box>
    </Box>
  );
};

export { Store };
