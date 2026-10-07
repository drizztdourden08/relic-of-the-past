/* @layer renderer-components @kind component */
/**
 * A set of numbers as equal stat tiles on the tile track: as many to a row as
 * the card holds at the tile's readable width, wrapping to the next row, never
 * stretched across a wide card with gaps between them.
 */
import { Grid } from '../../primitives/Grid';
import { StatTile } from '../../primitives/StatTile';
import type { StatTileGridProps } from './StatTileGrid.type';

const StatTileGrid = (props: StatTileGridProps) => {
  const { tiles, className } = props;

  return (
    <Grid track="tile" gap="sm" className={className}>
      {tiles.map((tile) => <StatTile key={tile.label} {...tile} />)}
    </Grid>
  );
};

export { StatTileGrid };
