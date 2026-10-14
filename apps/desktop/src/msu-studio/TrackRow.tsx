/* @layer renderer-components @kind component */
import { Status, Box, Text } from '@drizztdourden08/tessera/primitives';
import { TrackActions } from './TrackActions';
import { TrackFileCell } from './TrackFileCell';
import type { TrackRowProps } from './msu.type';

const TrackRow = (props: TrackRowProps) => {
  const { trackNum, description, fileName, fileSize, layerCount, options, readOnly, expanded, onAssign } = props;

  return (
    <Box className={`track-list__item msu-track-row${expanded ? ' msu-track-row--open' : ''}`}>
      <Text className="track-list__num">#{trackNum}</Text>
      <Text className="track-list__name">{description}</Text>

      <TrackFileCell
        trackNum={trackNum}
        fileName={fileName}
        fileSize={fileSize}
        options={options}
        readOnly={readOnly}
        onAssign={onAssign}
      />

      {layerCount > 1 && <Status tone="success">{layerCount} layers</Status>}

      <TrackActions {...props} />
    </Box>
  );
};

export { TrackRow };
