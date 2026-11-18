/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Grid, SectionHeader, Status, Tag } from '@drizztdourden08/tessera/primitives';
import { PoolFillBar } from '@app/compounds/PoolFillBar';
import { locationTilesOf } from '../behavior/location-tiles';
import { outOf } from '../behavior/tally-out-of';
import { StatTiles } from './StatTiles';
import { FLAG_MIN_WIDTH } from './StatTiles.constants';
import type { PoolSummaryProps } from './PoolSummary.type';

const PoolSummary = (props: PoolSummaryProps) => {
  const { accounting, totals, error, summary } = props;
  const t = useT();
  const text = useText();

  return (
    <>
      <PoolFillBar totals={totals} error={error} />
      {accounting !== null && <StatTiles tiles={locationTilesOf(t, accounting)} />}
      <SectionHeader title={t('views-randomizer:pool.scopes')} action={<Tag>{outOf(t, summary.scopes)}</Tag>} />
      <Grid minColWidth={FLAG_MIN_WIDTH} gap="xs">
        {summary.scopeFlags.map((flag) => (
          <Status key={flag.id} tone={flag.on ? 'success' : 'neutral'} variant="pill" dot title={t('views-randomizer:pool.flagState', { label: text(flag.label), state: flag.on ? 'on' : 'off' })}>
            {text(flag.label)}
          </Status>
        ))}
      </Grid>
    </>
  );
};

export { PoolSummary };
