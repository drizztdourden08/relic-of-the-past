/* @layer renderer-components @kind component */
import { Box, EmptyState } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { SoundListItem } from './SoundListItem';
import { soundPreviewKey } from './behavior/preview-key';
import type { EffectRowsProps } from './EffectRows.type';

const EffectRows = (props: EffectRowsProps) => {
  const { panel } = props;
  const { rows, filter, panelOf, toggleLayers, play, playOriginal } = panel;
  const t = useT();

  if (rows.length === 0) return <EmptyState message={t('msu-studio:sound.empty.effects', { filter })} />;

  return (
    <Box className="track-list">
      {rows.map(({ channel, row }) => (
        <SoundListItem
          key={soundPreviewKey(channel, row.soundId)}
          channel={channel}
          row={row}
          sound={panelOf(channel)}
          showChannel
          onSelect={toggleLayers}
          onPreview={play}
          onPlayOriginal={playOriginal}
        />
      ))}
    </Box>
  );
};

export { EffectRows };
