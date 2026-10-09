/* @layer renderer-components @kind component */
import type { OptimizeCandidate } from '@shared/types/msu-optimize';
import { Status, Box, Text } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import { UNKNOWN } from './CandidateRow.constants';
import type { CandidateRowProps } from './CandidateRow.type';

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
        <Status tone="neutral" title="Its repeat point is written into the manifest first">↻</Status>
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
          <Status tone="warning">unreadable</Status>
          <Text className="msu-optimize__cell msu-optimize__cell--faint">left as it is</Text>
        </>
      )}
    </Box>
  );
};

export { CandidateRow };
