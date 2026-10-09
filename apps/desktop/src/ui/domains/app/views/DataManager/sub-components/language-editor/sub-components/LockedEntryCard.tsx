/* @layer renderer-components @kind component */
import { Status, Box, Text } from '@drizztdourden08/tessera/primitives';
import type { LockedEntryCardProps } from './LockedEntryCard.type';
import '@rotp/design';

const LockedEntryCard = (props: LockedEntryCardProps) => {
  const { id, reason } = props;

  return (
    <Box className="entry-row entry-row--locked" title={reason}>
      <Text as="span" className="entry-row__caret" aria-hidden="true">·</Text>
      <Text as="span" className="entry-row__id">{`#${String(id).padStart(3, '0')}`}</Text>
      <Text as="span" className="entry-row__who entry-row__who--unknown">engine scaffolding</Text>
      <Text as="span" className="entry-row__slot">
        <Status tone="warning" className="entry-row__trigger">locked</Status>
      </Text>
      <Text as="span" className="entry-row__size" />
      <Text as="span" className="entry-row__choice" />
      <Text as="span" className="entry-row__excerpt">{reason}</Text>
      <Text as="span" className="entry-row__slot" />
      <Text as="span" className="entry-row__slot" />
    </Box>
  );
};

export { LockedEntryCard };
