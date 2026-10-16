/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { TrackRow } from './TrackRow';
import type { TrackSectionProps } from './TrackSection.type';

const TrackSection = (props: TrackSectionProps) => {
  const { title, rows, files, selected, controls, onSelect } = props;

  if (rows.length === 0) return null;

  return (
    <Box className="detail-panel__section">
      <Text as="h4" className="detail-panel__section-title">{title}</Text>
      <Box className="track-list">
        {rows.map((row) => (
          <TrackRow
            key={row.trackNum}
            row={row}
            fileSize={files.find((f) => f.name === row.fileName)?.size}
            selected={selected === row.trackNum}
            controls={controls}
            onSelect={onSelect}
          />
        ))}
      </Box>
    </Box>
  );
};

export { TrackSection };
