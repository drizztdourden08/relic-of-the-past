/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import playIcon from '@iconify-icons/lucide/play';
import squareIcon from '@iconify-icons/lucide/square';
import { Box, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { FilePlayer } from '../../FilePlayer/index';
import type { SlotFileProps } from '../TrackList.type';

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
          <IconifyIcon icon={playing ? squareIcon : playIcon} />
        </IconButton>
      </Box>
      {note ? <Text as="span" variant="caption" className="pack-tracks__note">{note}</Text> : null}
      {playing && audition !== null ? <FilePlayer audition={audition} /> : null}
    </Box>
  );
};

export { SlotFile };
