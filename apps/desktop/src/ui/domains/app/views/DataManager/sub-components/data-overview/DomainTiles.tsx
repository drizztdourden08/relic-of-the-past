/* @layer renderer-components @kind component */
import { Grid, Icon } from '@drizztdourden08/tessera/primitives';
import { StatTile } from '@drizztdourden08/tessera/composites';
import { formatBytes } from '@drizztdourden08/brock-core';
import { DOMAIN_ICONS } from './data-overview.constants';
import type { DomainTilesProps } from './DomainTiles.type';

const DomainTiles = (props: DomainTilesProps) => {
  const { domains } = props;

  return (
    <Grid minColWidth={140} gap="sm">
      {domains.map((d) => (
        <StatTile
          key={d.domain}
          label={<><Icon name={DOMAIN_ICONS[d.domain] ?? 'folder'} inline /> {d.label}</>}
          value={d.count}
          delta={formatBytes(d.bytes)}
          deltaTone="neutral"
        />
      ))}
    </Grid>
  );
};

export { DomainTiles };
