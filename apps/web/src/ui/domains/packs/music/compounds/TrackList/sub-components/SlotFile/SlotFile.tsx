/* @layer renderer-components @kind component */
/** One file a slot plays: its name and a play button, with the player open under it while it sounds. */
import { Box, IconButton, Text } from '@ds/primitives';
import { FilePlayer } from '../../../FilePlayer';
import type { Audition } from '../../../../behavior/file-audition';

type SlotFileProps = {
  name: string;
  playing: boolean;
  loading: boolean;
  /** Set only while this file is the one sounding. */
  audition: Audition | null;
  /** Why it did not play, if it did not. */
  note?: string;
  onPlay: (fileName: string) => void;
};

const SlotFile = (props: SlotFileProps) => {
  const { name, playing, loading, audition, note, onPlay } = props;

  return (
    <Box className={`pack-tracks__file${playing ? ' pack-tracks__file--playing' : ''}`}>
      <Box className="pack-tracks__file-line">
        <Text as="span" className="pack-tracks__file-name" title={name}>{name}</Text>
        <IconButton
          variant="ghost"
          size="sm"
          label={playing ? `Stop ${name}` : `Play ${name}`}
          active={playing}
          disabled={loading}
          onClick={() => onPlay(name)}
        >
          {playing ? '■' : '▶'}
        </IconButton>
      </Box>
      {note ? <Text as="span" variant="caption" className="pack-tracks__note">{note}</Text> : null}
      {playing && audition !== null ? <FilePlayer audition={audition} /> : null}
    </Box>
  );
};

export { SlotFile };
export type { SlotFileProps };
