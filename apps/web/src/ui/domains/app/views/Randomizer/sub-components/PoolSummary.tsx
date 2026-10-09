/* @layer renderer-components @kind component */
import { Chip, FlagPill, Grid, SectionHeader } from '@drizztdourden08/tessera/primitives';
import { DashboardPanel, StatTileGrid } from '@drizztdourden08/tessera/composites';
import { PoolFillBar } from '@domains/app/compounds/PoolFillBar';
import { locationTilesOf } from '../behavior/location-tiles';
import { outOf } from '../behavior/tally-out-of';
import type { PoolSummaryProps } from './PoolSummary.type';

const PoolSummary = (props: PoolSummaryProps) => {
  const { placement, accounting, totals, error, summary } = props;

  return (
    <DashboardPanel {...placement} title="Item pool">
      <PoolFillBar totals={totals} error={error} legend="stacked" />
      {accounting !== null && <StatTileGrid tiles={locationTilesOf(accounting)} />}
      <SectionHeader title="Shuffle scopes" action={<Chip>{outOf(summary.scopes)}</Chip>} />
      <Grid track="flag" gap="xs">
        {summary.scopeFlags.map((flag) => <FlagPill key={flag.id} label={flag.label} on={flag.on} />)}
      </Grid>
    </DashboardPanel>
  );
};

export { PoolSummary };
export type { PoolSummaryProps };
