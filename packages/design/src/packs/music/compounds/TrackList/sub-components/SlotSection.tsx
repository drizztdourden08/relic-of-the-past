/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { SlotRowView } from './SlotRowView';
import type { SlotSectionProps } from '../TrackList.type';

const SlotSection = (props: SlotSectionProps) => {
  const { title, rows, playing, loading, audition, notes, onPlay } = props;
  if (rows.length === 0) return null;

  return (
    <Box className="pack-tracks__section">
      <Text as="h4" className="pack-tracks__heading">{title}</Text>
      {rows.map((row) => (
        <SlotRowView
          key={row.key}
          row={row}
          playing={playing}
          loading={loading}
          audition={audition}
          notes={notes}
          onPlay={onPlay}
        />
      ))}
    </Box>
  );
};

export { SlotSection };
