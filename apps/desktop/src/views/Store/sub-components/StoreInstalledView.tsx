/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box } from '@drizztdourden08/tessera/primitives';
import type { StoreInstalledViewProps } from '../Store.type';
import { useStore } from '../behavior/useStore';
import { StoreInstalledList } from './StoreInstalledList';

const StoreInstalledView = (props: StoreInstalledViewProps) => {
  const { mode } = props;
  const t = useT();
  const store = useStore({ kind: null });

  return (
    <Box className="store">
      <StoreInstalledList rows={mode === 'updates' ? store.updates : store.rows} emptyText={t(mode === 'updates' ? 'views-store:installed.empty.updates' : 'views-store:installed.empty.installed')} store={store} />
    </Box>
  );
};

export { StoreInstalledView };
