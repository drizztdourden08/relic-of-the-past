/* @layer renderer-components @kind component */
import { Grid, Icon } from '@drizztdourden08/tessera/primitives';
import { StatTile } from '@drizztdourden08/tessera/composites';
import { formatBytes } from '@drizztdourden08/brock-core';
import { useText } from '@drizztdourden08/brock-react';
import { DOMAIN_ICONS, DOMAIN_LABELS } from './DomainTiles.constants';
import type { DomainTilesProps } from './DomainTiles.type';

const DomainTiles = (props: DomainTilesProps) => {
  const { domains } = props;
  const text = useText();
  const labelOf = (domain: string, fallback: string): string => {
    const message = DOMAIN_LABELS[domain];
    return message === undefined ? fallback : text(message);
  };

  return (
    <Grid minColWidth={140} gap="sm">
      {domains.map((d) => (
        <StatTile
          key={d.domain}
          label={<><Icon name={DOMAIN_ICONS[d.domain] ?? 'folder'} inline /> {labelOf(d.domain, d.label)}</>}
          value={d.count}
          delta={formatBytes(d.bytes)}
          deltaTone="neutral"
        />
      ))}
    </Grid>
  );
};

export { DomainTiles };
