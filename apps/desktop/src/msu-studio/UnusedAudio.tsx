/* @layer renderer-components @kind component */
import { Box, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import { useT } from '@drizztdourden08/brock-react';
import type { UnusedAudioProps } from './UnusedAudio.type';

const UnusedAudio = (props: UnusedAudioProps) => {
  const { unusedFiles, busy, readOnly, onDeleteFile } = props;
  const t = useT();
  if (unusedFiles.length === 0) return null;

  return (
    <Box className="detail-panel__section">
      <Text as="h4" className="detail-panel__section-title">
        {t('msu-studio:track.unused.title', { count: unusedFiles.length })}
      </Text>
      <Box className="track-list">
        {unusedFiles.map((file) => (
          <Box key={file.name} className="track-list__item">
            <Text className="track-list__num">-</Text>
            <Text className="track-list__name">{file.name}</Text>
            <Text className="track-list__size">{formatBytes(file.size)}</Text>
            <IconButton
              variant="ghost" size="sm" label={t('msu-studio:files.actions.delete', { name: file.name })} disabled={busy || readOnly}
              onClick={() => onDeleteFile(file.name)}
            >
              ✕
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { UnusedAudio };
