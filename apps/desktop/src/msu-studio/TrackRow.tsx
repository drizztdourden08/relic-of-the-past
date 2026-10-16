/* @layer renderer-components @kind component */
import { Box, Pressable, Status, Text } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import { TrackActions } from './TrackActions';
import type { TrackRowProps } from './msu.type';

const TrackRow = (props: TrackRowProps) => {
  const { row, fileSize, selected, controls, onSelect } = props;
  const { trackNum, description, fileName, layerCount } = row;

  return (
    <Box className={`track-list__item msu-track-row${selected ? ' msu-track-row--selected' : ''}`}>
      <Pressable className="msu-track-row__main" aria-pressed={selected} onClick={() => onSelect(trackNum)}>
        <Text as="span" className="track-list__num">#{trackNum}</Text>
        <Text as="span" className="track-list__name">{description}</Text>
        <Text as="span" className={`msu-track-row__file${fileName === null ? ' msu-track-row__file--empty' : ''}`}>
          {fileName ?? 'No file'}
        </Text>
        {fileSize != null && <Text as="span" className="track-list__size">{formatBytes(fileSize)}</Text>}
        {layerCount > 1 && <Status tone="success">{layerCount} layers</Status>}
      </Pressable>
      <TrackActions trackNum={trackNum} hasAudio={fileName !== null} controls={controls} />
    </Box>
  );
};

export { TrackRow };
