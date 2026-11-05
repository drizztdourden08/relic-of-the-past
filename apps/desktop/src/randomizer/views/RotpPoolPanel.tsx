/* @layer renderer-components @kind component */
import type { RunPanelProps } from '@drizztdourden08/brock-randomizer';
import { Grid, SectionHeader, Status, Tag } from '@drizztdourden08/tessera/primitives';
import { PoolFillBar } from '@app/compounds/PoolFillBar';
import { locationTilesOf } from '@app/views/Randomizer/behavior/location-tiles';
import { outOf } from '@app/views/Randomizer/behavior/tally-out-of';
import { StatTiles } from '@app/views/Randomizer/sub-components/StatTiles';
import { FLAG_MIN_WIDTH } from '@app/views/Randomizer/sub-components/StatTiles.constants';
import { useRotpRunSummary } from './useRotpRunSummary';

const RotpPoolPanel = ({ config }: RunPanelProps) => {
  const { accounting, error, totals, summary } = useRotpRunSummary({ config });

  return (
    <>
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
    </>
  );
};

export { RotpPoolPanel };
