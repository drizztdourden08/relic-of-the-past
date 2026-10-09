/* @layer renderer-components @kind component */
import { Grid, SectionHeader, Status, Tag } from '@drizztdourden08/tessera/primitives';
import { PoolFillBar } from '@app/compounds/PoolFillBar';
import { locationTilesOf } from '../behavior/location-tiles';
import { outOf } from '../behavior/tally-out-of';
import { DashboardCard } from './DashboardCard';
import { StatTiles } from './StatTiles';
import { FLAG_MIN_WIDTH } from './StatTiles.constants';
import type { PoolSummaryProps } from './PoolSummary.type';

const PoolSummary = (props: PoolSummaryProps) => {
  const { placement, accounting, totals, error, summary } = props;

  return (
    <DashboardCard placement={placement} title="Item pool">
      <PoolFillBar totals={totals} error={error} />
      {accounting !== null && <StatTiles tiles={locationTilesOf(accounting)} />}
      <SectionHeader title="Shuffle scopes" action={<Tag>{outOf(summary.scopes)}</Tag>} />
      <Grid minColWidth={FLAG_MIN_WIDTH} gap="xs">
        {summary.scopeFlags.map((flag) => (
          <Status key={flag.id} tone={flag.on ? 'success' : 'neutral'} variant="pill" dot title={`${flag.label}: ${flag.on ? 'on' : 'off'}`}>
            {flag.label}
          </Status>
        ))}
      </Grid>
    </DashboardCard>
  );
};

export { PoolSummary };
export type { PoolSummaryProps };
