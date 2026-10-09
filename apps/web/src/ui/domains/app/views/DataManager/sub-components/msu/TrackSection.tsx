/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { TrackRow } from './TrackRow';
import { PreviewReadout } from './PreviewReadout';
import { trackPreviewKey } from './behavior/preview-key';
import type { TrackSectionProps } from './TrackSection.type';

const TrackSection = (props: TrackSectionProps) => {
  const {
    title, rows, files, fileOptions, playing, playingOriginal, reportStore, openTrack, busy, readOnly,
    onAssign, onPreview, onStopPreview, onPlayOriginal, onToggleLayers, renderDetail,
  } = props;

  if (rows.length === 0) return null;

  return (
    <Box className="detail-panel__section">
      <Text as="h4" className="detail-panel__section-title">{title}</Text>
      <Box className="track-list">
        {rows.map((row) => (
          <Box key={row.trackNum}>
            <TrackRow
              trackNum={row.trackNum}
              description={row.description}
              fileName={row.fileName}
              fileSize={files.find((f) => f.name === row.fileName)?.size}
              layerCount={row.layerCount}
              options={fileOptions}
              playing={playing === row.trackNum}
              busy={busy}
              expanded={openTrack === row.trackNum}
              playingOriginal={playingOriginal === row.trackNum}
              readOnly={readOnly}
              onAssign={onAssign}
              onPreview={onPreview}
              onStopPreview={onStopPreview}
              onPlayOriginal={onPlayOriginal}
              onToggleLayers={onToggleLayers}
            />
            {playing === row.trackNum && (
              <PreviewReadout
                store={reportStore}
                previewKey={trackPreviewKey(row.trackNum)}
                label={`slot ${row.trackNum}`}
              />
            )}
            {openTrack === row.trackNum && renderDetail(row.trackNum)}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { TrackSection };
