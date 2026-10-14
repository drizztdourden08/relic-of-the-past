/* @layer renderer-components @kind component */
import { Box, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import type { FileActionsProps } from './FileActions.type';

const FileActions = (props: FileActionsProps) => {
  const { name, playing, loading, busy, readOnly, onPlay, onDelete } = props;
  return (
    <Box className="msu-file-row__actions">
      <IconButton
        variant="ghost"
        size="sm"
        label={playing ? `Stop ${name}` : `Play ${name}`}
        active={playing}
        disabled={loading}
        onClick={() => onPlay(name)}
      >
        <Icon name={playing ? 'square' : 'play'} />
      </IconButton>
      <IconButton
        variant="ghost" size="sm" label={`Delete ${name}`} disabled={busy || readOnly}
        onClick={() => onDelete(name)}
      >
        ✕
      </IconButton>
    </Box>
  );
};

export { FileActions };
