/* @layer renderer-components @kind component */
import { SidePanel } from '@drizztdourden08/tessera/composites';
import { PoolListing } from '../PoolListing';
import { POOL_CONTAINER_TITLE, POOL_PANEL_SIZE, POOL_PANEL_TITLE, POOL_STORAGE_KEY } from './PoolSidePanel.constants';
import type { PoolSidePanelProps } from './PoolSidePanel.type';

const PoolSidePanel = ({ groups, totals, error }: PoolSidePanelProps) => (
  <SidePanel
    side="end"
    title={POOL_PANEL_TITLE}
    {...POOL_PANEL_SIZE}
    storageKey={POOL_STORAGE_KEY}
    containers={[{
      title: POOL_CONTAINER_TITLE,
      content: <PoolListing groups={groups} totals={totals} error={error} titled={false} />,
    }]}
  />
);

export { PoolSidePanel };
