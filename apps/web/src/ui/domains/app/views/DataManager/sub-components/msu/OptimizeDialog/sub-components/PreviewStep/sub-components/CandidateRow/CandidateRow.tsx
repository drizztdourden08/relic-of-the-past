/* @layer renderer-components @kind component */
/**
 * One file in the preview: what it costs now, what it would cost, and the difference.
 *
 * The difference carries its sign because the sign IS the message. A saving reads plain; a file
 * the target format would make bigger reads `+` in the danger colour and stays in the run — the
 * pack ending up in one format is the point, and an already-compressed file pays for that in
 * bytes rather than in quality.
 *
 * The repeat-point mark is on the row rather than in a summary because it is per file: only a
 * container that carries its own loop position has one to move.
 */
import type { OptimizeCandidate } from '@shared/types/msu-optimize';
import { Badge } from '@ds/primitives/Badge';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { formatBytes } from '@app/utils/formatBytes';
import type { CandidateRowProps } from './CandidateRow.type';

const UNKNOWN = '—';

const deltaLabel = (row: OptimizeCandidate): string => {
  if (row.estimatedBytes === null) return UNKNOWN;
  const saved = row.currentBytes - row.estimatedBytes;
  return saved < 0 ? `+${formatBytes(-saved)}` : `−${formatBytes(saved)}`;
};

const isGrowth = (row: OptimizeCandidate): boolean =>
  row.estimatedBytes !== null && row.estimatedBytes > row.currentBytes;

const CandidateRow = (props: CandidateRowProps) => {
  const { row } = props;

  return (
    <Box className="msu-optimize__row">
      <Text className="msu-optimize__row-name" title={row.name}>{row.name}</Text>

      {row.carryLoopSample !== null && (
        <Badge variant="neutral" title="Its repeat point is written into the manifest first">↻</Badge>
      )}

      <Text className="msu-optimize__cell">{formatBytes(row.currentBytes)}</Text>

      {row.excludedBecause === null ? (
        <>
          <Text className="msu-optimize__cell msu-optimize__cell--faint">→</Text>
          <Text className="msu-optimize__cell">
            {row.estimatedBytes === null ? UNKNOWN : formatBytes(row.estimatedBytes)}
          </Text>
          <Text className={`msu-optimize__cell${isGrowth(row) ? ' msu-optimize__cell--bad' : ''}`}>
            {deltaLabel(row)}
          </Text>
        </>
      ) : (
        <>
          <Badge variant="warning">unreadable</Badge>
          <Text className="msu-optimize__cell msu-optimize__cell--faint">left as it is</Text>
        </>
      )}
    </Box>
  );
};

export { CandidateRow };
export type { CandidateRowProps };
