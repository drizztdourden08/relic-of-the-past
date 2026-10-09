/* @layer renderer-components @kind component */
import { Grid, ProgressBar } from '@drizztdourden08/tessera/primitives';
import { StatTile } from '@drizztdourden08/tessera/composites';
import { TILE_MIN_WIDTH } from './StatTiles.constants';
import type { StatTilesProps } from './StatTiles.type';

const StatTiles = ({ tiles }: StatTilesProps) => (
  <Grid minColWidth={TILE_MIN_WIDTH} gap="sm">
    {tiles.map(({ label, value, tone, meter }) => (
      <StatTile
        key={label}
        label={label}
        value={value}
        tone={tone}
        size="sm"
        chart={meter && <ProgressBar value={meter.value} max={Math.max(1, meter.max)} tone="secondary" label={label} />}
      />
    ))}
  </Grid>
);

export { StatTiles };
export type { StatTilesProps };
