/* @layer renderer-components @kind component */
/** One slot: its number, its name, how many layers it has, and every file it plays. */
import { Badge, Box, Text } from '@ds/primitives';
import { SlotFile } from '../SlotFile';
import type { Audition } from '../../../../behavior/file-audition';
import type { SlotRow } from '../../TrackList.type';

type SlotRowViewProps = {
  row: SlotRow;
  playing: string | null;
  loading: string | null;
  audition: Audition | null;
  notes: ReadonlyMap<string, string>;
  onPlay: (fileName: string) => void;
};

const SlotRowView = (props: SlotRowViewProps) => {
  const { row, playing, loading, audition, notes, onPlay } = props;

  return (
    <Box className="pack-tracks__row">
      <Text as="span" className="pack-tracks__num">{row.number}</Text>
      <Text as="span" className="pack-tracks__title">{row.title}</Text>
      {row.layerCount > 1 ? <Badge variant="success">{row.layerCount} layers</Badge> : <Box />}
      <Box className="pack-tracks__files">
        {row.files.length === 0 ? <Text as="span" variant="caption">No file</Text> : null}
        {row.files.map((name) => (
          <SlotFile
            key={name}
            name={name}
            playing={playing === name}
            loading={loading === name}
            audition={playing === name ? audition : null}
            note={notes.get(name)}
            onPlay={onPlay}
          />
        ))}
      </Box>
    </Box>
  );
};

export { SlotRowView };
export type { SlotRowViewProps };
