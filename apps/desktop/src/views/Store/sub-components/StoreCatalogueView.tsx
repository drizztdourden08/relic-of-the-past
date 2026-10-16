/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import type { StoreParams } from '../Store.type';
import { useStore } from '../behavior/useStore';
import { StoreBrowse } from './StoreBrowse';

const StoreCatalogueView = (props: StoreParams) => {
  const store = useStore(props);

  return (
    <Box className="store">
      <StoreBrowse store={store} />
    </Box>
  );
};

export { StoreCatalogueView };
