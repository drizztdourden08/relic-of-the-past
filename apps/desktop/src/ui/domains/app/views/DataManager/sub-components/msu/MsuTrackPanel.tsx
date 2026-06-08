/* @layer renderer-components @kind component */
import type { SelectOption } from '../../../../../../design-system/primitives/Select';
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 className="detail-panel__title">{selected}</h3>
      <div className="detail-panel__grid" style={{ marginBottom: 'var(--space-md)' }}>
        <span className="detail-panel__label">Tracks</span>
        <span className="detail-panel__value">{trackInfos.length}</span>
        <span className="detail-panel__label">Total Size</span>
        <span className="detail-panel__value">{formatBytes(files.reduce((s, f) => s + f.size, 0))}</span>
        <span className="detail-panel__label">Type</span>
        <span className="detail-panel__value">
          {isDeluxe ? 'Deluxe' : 'Standard'}
          {hasOpuz ? ' (Opus)' : ' (PCM)'}
        </span>
      </div>

      {standardTracks.length > 0 && (
        <div className="detail-panel__section">
          <h4 className="detail-panel__section-title">Standard Tracks</h4>
          <div className="track-list">
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
          </div>
        </div>
      )}

      {deluxeTracks.length > 0 && (
        <div className="detail-panel__section">
          <h4 className="detail-panel__section-title">Deluxe Tracks</h4>
          <div className="track-list">
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
          </div>
        </div>
      )}

      {unmatchedFiles.length > 0 && (
        <div className="detail-panel__section">
          <h4 className="detail-panel__section-title" style={{ color: 'var(--color-text-muted)' }}>
            Unmatched Files ({unmatchedFiles.length})
          </h4>
          <div className="track-list">
            {unmatchedFiles.map((f) => (
              <div key={f.fileName} className="track-list__item">
                <span className="track-list__num" style={{ color: 'var(--color-text-faint)' }}>—</span>
                <span className="track-list__name" style={{ color: 'var(--color-text-muted)' }}>{f.fileName}</span>
                <span className="track-list__size">
                  {formatBytes(files.find((file) => file.name === f.fileName)?.size ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { MsuTrackPanel };
export type { MsuTrackPanelProps };
