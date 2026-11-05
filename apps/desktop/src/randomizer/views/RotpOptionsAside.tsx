/* @layer renderer-components @kind component */
import type { OptionTabProps } from '@drizztdourden08/brock-randomizer';
import { SidePanel } from '@drizztdourden08/tessera/composites';
import { PoolListing } from '@app/compounds/PoolListing';
import { usePoolListing } from '@app/hooks/randomizer/usePoolListing';
import { usePoolTotals } from '@app/hooks/randomizer/usePoolTotals';
import { useGameSession } from '@app/hooks/useGameSession';
import {
  POOL_CONTAINER_TITLE, POOL_PANEL_SIZE, POOL_PANEL_TITLE, POOL_STORAGE_KEY,
} from '@app/views/DataManager/sub-components/profile-manager/RandomizerOptionsPanel.constants';
import { useRotpOptionModel } from './useRotpOptionModel';

const RotpOptionsAside = (props: OptionTabProps) => {
  const { snapshot, accounting, error } = useRotpOptionModel(props);
  const { activeProfile } = useGameSession().profileMgmt;
  const listing = usePoolListing(snapshot, activeProfile?.romFile || null, props.seed);
  const totals = usePoolTotals(accounting);

  return (
    <SidePanel
      side="end"
      title={POOL_PANEL_TITLE}
      {...POOL_PANEL_SIZE}
      storageKey={POOL_STORAGE_KEY}
      containers={[{
        title: POOL_CONTAINER_TITLE,
        content: <PoolListing groups={listing} totals={totals} error={error} titled={false} />,
      }]}
    />
  );
};

export { RotpOptionsAside };
