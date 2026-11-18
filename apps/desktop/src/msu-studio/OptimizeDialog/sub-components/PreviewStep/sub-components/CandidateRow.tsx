/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import type { OptimizeCandidate } from '@rotp/msu';
import { Status, Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
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
  const t = useT();

  return (
    <Box className="msu-optimize__row">
      <Text className="msu-optimize__row-name" title={row.name}>{row.name}</Text>

      {row.carryLoopSample !== null && (
        <Status tone="neutral" title={t('msu-studio:optimize.row.repeat-title')}>↻</Status>
      )}

      <Text className="msu-optimize__cell">{formatBytes(row.currentBytes)}</Text>

      {row.excludedBecause === null ? (
        <>
          <Text className="msu-optimize__cell msu-optimize__cell--faint"><Icon name="arrow-right" inline /></Text>
          <Text className="msu-optimize__cell">
            {row.estimatedBytes === null ? UNKNOWN : formatBytes(row.estimatedBytes)}
          </Text>
          <Text className={`msu-optimize__cell${isGrowth(row) ? ' msu-optimize__cell--bad' : ''}`}>
            {deltaLabel(row)}
          </Text>
        </>
      ) : (
        <>
          <Status tone="warning">{t('msu-studio:optimize.row.unreadable')}</Status>
          <Text className="msu-optimize__cell msu-optimize__cell--faint">{t('msu-studio:optimize.row.left')}</Text>
        </>
      )}
    </Box>
  );
};

export { CandidateRow };
