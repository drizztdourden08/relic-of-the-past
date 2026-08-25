/* @layer renderer-components @kind component */
/**
 * What the pack is made of, read at a glance: how many files and how much disk, which formats they
 * are in, and how many of them nothing plays.
 *
 * The format breakdown is here rather than on the pack header because it is the thing that decides
 * whether a pack will play everywhere — MSU-1 pcm is the format every build handles natively, and a
 * pack that is mostly something else is worth knowing about before it is exported.
 *
 * The two actions belong to the pack as a whole rather than to any row: normalising every file to
 * one format, and throwing out the originals a converted file has already taken over from. The
 * second only appears once there is something to throw out, so a pack that has never been
 * converted is not offered a button that would do nothing.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { formatBytes } from '@app/utils/formatBytes';
import type { FormatCount } from './behavior/useFilePanel';

interface PackSummaryProps {
  fileCount: number;
  totalSize: number;
  /** One entry per format present, the biggest group first. */
  formats: FormatCount[];
  /** How many files no slot and no sound names. */
  unusedCount: number;
  /** Originals a same-stem converted file has already taken over from. */
  supersededCount: number;
  supersededBytes: number;
  /** Why normalising is not on offer, or null when it is. */
  optimizeBlockedBecause: string | null;
  busy: boolean;
  onOptimize: () => void;
  onRemoveSuperseded: () => void;
}

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
        <Text className="detail-panel__value">{breakdown.length > 0 ? breakdown : '—'}</Text>
        <Text className="detail-panel__label">Unused</Text>
        <Text className="detail-panel__value">
          {unusedCount === 0
            ? 'None — every file is played by something'
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
          Optimize…
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
export type { PackSummaryProps };
