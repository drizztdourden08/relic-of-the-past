/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { INSTALLED_EMPTY } from '../Store.constants';
import type { StoreInstalledViewProps } from '../Store.type';
import { useStore } from '../behavior/useStore';
import { StoreInstalledList } from './StoreInstalledList';

const StoreInstalledView = (props: StoreInstalledViewProps) => {
  const { mode } = props;
  const store = useStore({ kind: null });

  return (
    <Box className="store">
      <StoreInstalledList rows={mode === 'updates' ? store.updates : store.rows} emptyText={INSTALLED_EMPTY[mode]} store={store} />
    </Box>
  );
};

export { StoreInstalledView };
