/* @layer renderer-components @kind component */
/** One titled band of slots, with the expanded slot's editor spliced in directly beneath its row. */
import type { ReactNode } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { TrackRow } from './TrackRow';
import { PreviewReadout } from './PreviewReadout';
import { trackPreviewKey } from './behavior/preview-key';
import type { PreviewReportStore } from './behavior/preview-report-store';
import type { MatchedTrack, MsuFile } from './msu.type';
import type { SelectOption } from '@ds/primitives/Select';

interface TrackSectionProps {
  title: string;
  rows: MatchedTrack[];
  files: MsuFile[];
  fileOptions: SelectOption[];
  playing: number | null;
  /** Which slot's original is sounding, if any. */
  playingOriginal: number | null;
  /** Feeds the live readout that opens under whichever row is playing. */
  reportStore: PreviewReportStore;
  openTrack: number | null;
  busy: boolean;
  onAssign: (trackNum: number, fileName: string) => void;
  onPreview: (trackNum: number) => void;
  onStopPreview: () => void;
  onPlayOriginal: (trackNum: number) => void;
  onToggleLayers: (trackNum: number) => void;
  renderDetail: (trackNum: number) => ReactNode;
}

const TrackSection = (props: TrackSectionProps) => {
  const {
    title, rows, files, fileOptions, playing, playingOriginal, reportStore, openTrack, busy,
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
export type { TrackSectionProps };
