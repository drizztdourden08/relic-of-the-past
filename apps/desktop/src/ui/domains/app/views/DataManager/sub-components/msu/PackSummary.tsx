/* @layer renderer-components @kind component */
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@app/utils/formatBytes';
import type { PackSummaryProps } from './PackSummary.type';

const PackSummary = (props: PackSummaryProps) => {
  const {
    fileCount, totalSize, formats, unusedCount, supersededCount, supersededBytes,
    optimizeBlockedBecause, busy, onOptimize, onRemoveSuperseded,
  } = props;
  const breakdown = formats.map((format) => `${format.count} ${format.ext}`).join(', ');

  return (
    <Box className="msu-file-summary">
      <Box className="detail-panel__grid">
        <Text className="detail-panel__label">Files</Text>
        <Text className="detail-panel__value">{fileCount} · {formatBytes(totalSize)}</Text>
        <Text className="detail-panel__label">Formats</Text>
        <Text className="detail-panel__value">{breakdown.length > 0 ? breakdown : '-'}</Text>
        <Text className="detail-panel__label">Unused</Text>
        <Text className="detail-panel__value">
          {unusedCount === 0
            ? 'None, because every file is played by something'
            : `${unusedCount} file${unusedCount === 1 ? '' : 's'} nothing plays`}
        </Text>
        {supersededCount > 0 && (
          <>
            <Text className="detail-panel__label">Superseded</Text>
            <Text className="detail-panel__value">
              {supersededCount} original{supersededCount === 1 ? '' : 's'} already covered by a
              converted file · {formatBytes(supersededBytes)}
            </Text>
          </>
        )}
      </Box>

      <Box className="msu-file-summary__actions">
        <Button
          variant="secondary"
          size="sm"
          disabled={busy || optimizeBlockedBecause !== null}
          title={optimizeBlockedBecause ?? 'Convert every file to one format, with a measured preview first'}
          onClick={onOptimize}
        >
          Optimize...
        </Button>
        {supersededCount > 0 && (
          <Button
            variant="danger"
            size="sm"
            disabled={busy}
            title="Delete the originals a converted file has taken over from"
            onClick={onRemoveSuperseded}
          >
            Remove {supersededCount} superseded
          </Button>
        )}
      </Box>
    </Box>
  );
};

export { PackSummary };
