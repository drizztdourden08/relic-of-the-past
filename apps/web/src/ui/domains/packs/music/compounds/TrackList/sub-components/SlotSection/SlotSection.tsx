/* @layer renderer-components @kind component */
/** One titled band of slots (music, or sounds); nothing at all when the pack fills none of them. */
import { Box, Text } from '@ds/primitives';
import { SlotRowView } from '../SlotRowView';
import type { Audition } from '../../../../behavior/file-audition';
import type { SlotRow } from '../../TrackList.type';

type SlotSectionProps = {
  title: string;
  rows: SlotRow[];
  playing: string | null;
  loading: string | null;
  audition: Audition | null;
  notes: ReadonlyMap<string, string>;
  onPlay: (fileName: string) => void;
};

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
export type { SlotSectionProps };
