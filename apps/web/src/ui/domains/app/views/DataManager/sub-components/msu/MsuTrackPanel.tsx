/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import type { SelectOption } from '../../../../../../design-system/primitives/Select';

const IL: Record<string, CSSProperties> = {
  col: { display: 'flex', flexDirection: 'column', height: '100%' },
  gridMb: { marginBottom: 'var(--space-md)' },
  muted: { color: 'var(--c-text-muted)' },
  faint: { color: 'var(--c-text-faint)' },
};
import { formatBytes } from '../../../../../../../utils/formatBytes';
import { TrackRow } from './TrackRow';
import type { MsuFile, TrackInfo, MatchedTrack } from './msu.type';

interface MsuTrackPanelProps {
  selected: string;
  files: MsuFile[];
  trackInfos: TrackInfo[];
  isDeluxe: boolean;
  hasOpuz: boolean;
  matchedTracks: MatchedTrack[];
  unmatchedFiles: TrackInfo[];
  fileOptions: SelectOption[];
  onTrackAssign: (trackNum: number, fileName: string) => void;
}

const MsuTrackPanel = (props: MsuTrackPanelProps) => {
  const { selected, files, trackInfos, isDeluxe, hasOpuz, matchedTracks, unmatchedFiles, fileOptions, onTrackAssign } = props;

  const standardTracks = matchedTracks.filter((t) => t.trackNum <= 36);
  const deluxeTracks = matchedTracks.filter((t) => t.trackNum > 36);

  return (
    <Box style={IL.col}>
      <Text as="h3" className="detail-panel__title">{selected}</Text>
      <Box className="detail-panel__grid" style={IL.gridMb}>
        <Text className="detail-panel__label">Tracks</Text>
        <Text className="detail-panel__value">{trackInfos.length}</Text>
        <Text className="detail-panel__label">Total Size</Text>
        <Text className="detail-panel__value">{formatBytes(files.reduce((s, f) => s + f.size, 0))}</Text>
        <Text className="detail-panel__label">Type</Text>
        <Text className="detail-panel__value">
          {isDeluxe ? 'Deluxe' : 'Standard'}
          {hasOpuz ? ' (Opus)' : ' (PCM)'}
        </Text>
      </Box>

      {standardTracks.length > 0 && (
        <Box className="detail-panel__section">
          <Text as="h4" className="detail-panel__section-title">Standard Tracks</Text>
          <Box className="track-list">
            {standardTracks.map((track) => (
              <TrackRow
                key={track.trackNum}
                trackNum={track.trackNum}
                description={track.description}
                fileName={track.fileName}
                fileSize={files.find((f) => f.name === track.fileName)?.size}
                options={fileOptions}
                onAssign={onTrackAssign}
              />
            ))}
          </Box>
        </Box>
      )}

      {deluxeTracks.length > 0 && (
        <Box className="detail-panel__section">
          <Text as="h4" className="detail-panel__section-title">Deluxe Tracks</Text>
          <Box className="track-list">
            {deluxeTracks.map((track) => (
              <TrackRow
                key={track.trackNum}
                trackNum={track.trackNum}
                description={track.description}
                fileName={track.fileName}
                fileSize={files.find((f) => f.name === track.fileName)?.size}
                options={fileOptions}
                onAssign={onTrackAssign}
              />
            ))}
          </Box>
        </Box>
      )}

      {unmatchedFiles.length > 0 && (
        <Box className="detail-panel__section">
          <Text as="h4" className="detail-panel__section-title" style={IL.muted}>
            Unmatched Files ({unmatchedFiles.length})
          </Text>
          <Box className="track-list">
            {unmatchedFiles.map((f) => (
              <Box key={f.fileName} className="track-list__item">
                <Text className="track-list__num" style={IL.faint}>—</Text>
                <Text className="track-list__name" style={IL.muted}>{f.fileName}</Text>
                <Text className="track-list__size">
                  {formatBytes(files.find((file) => file.name === f.fileName)?.size ?? 0)}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { MsuTrackPanel };
export type { MsuTrackPanelProps };
