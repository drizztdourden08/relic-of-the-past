/* @layer renderer-components @kind component */
import type { OptionTabProps } from '@drizztdourden08/brock-randomizer';
import { PoolSidePanel } from '@app/compounds/PoolSidePanel';
import { usePoolListing } from '@app/hooks/randomizer/usePoolListing';
import { usePoolTotals } from '@app/hooks/randomizer/usePoolTotals';
import { useRotpOptionModel } from './useRotpOptionModel';

const RotpOptionsAside = (props: OptionTabProps) => {
  const { snapshot, accounting, error } = useRotpOptionModel(props);
  const listing = usePoolListing(snapshot, props.romFile, props.seed);
  const totals = usePoolTotals(accounting);

  return <PoolSidePanel groups={listing} totals={totals} error={error} />;
};

export { RotpOptionsAside };
