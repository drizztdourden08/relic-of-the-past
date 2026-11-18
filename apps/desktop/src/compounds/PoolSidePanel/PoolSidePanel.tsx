/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { SidePanel } from '@drizztdourden08/tessera/composites';
import { PoolListing } from '../PoolListing';
import { POOL_PANEL_SIZE, POOL_STORAGE_KEY } from './PoolSidePanel.constants';
import type { PoolSidePanelProps } from './PoolSidePanel.type';

const PoolSidePanel = ({ groups, totals, error }: PoolSidePanelProps) => {
  const t = useT();

  return (
    <SidePanel
      side="end"
      title={t('compounds:pool-side-panel.title')}
      {...POOL_PANEL_SIZE}
      storageKey={POOL_STORAGE_KEY}
      containers={[{
        title: t('compounds:pool-side-panel.contents'),
        content: <PoolListing groups={groups} totals={totals} error={error} titled={false} />,
      }]}
    />
  );
};

export { PoolSidePanel };
