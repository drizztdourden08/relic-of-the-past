/* @layer renderer-components @kind component */
import { Box, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import type { FileActionsProps } from './FileActions.type';

const FileActions = (props: FileActionsProps) => {
  const { name, playing, loading, busy, readOnly, onPlay, onDelete } = props;
  const t = useT();
  return (
    <Box className="msu-file-row__actions">
      <IconButton
        variant="ghost"
        size="sm"
        label={playing ? t('msu-studio:files.actions.stop', { name }) : t('msu-studio:files.actions.play', { name })}
        active={playing}
        disabled={loading}
        onClick={() => onPlay(name)}
      >
        <Icon name={playing ? 'square' : 'play'} />
      </IconButton>
      <IconButton
        variant="ghost" size="sm" label={t('msu-studio:files.actions.delete', { name })} disabled={busy || readOnly}
        onClick={() => onDelete(name)}
      >
        ✕
      </IconButton>
    </Box>
  );
};

export { FileActions };
