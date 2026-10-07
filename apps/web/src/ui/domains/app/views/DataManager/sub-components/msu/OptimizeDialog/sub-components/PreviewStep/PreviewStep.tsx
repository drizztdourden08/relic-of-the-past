/* @layer renderer-components @kind component */
// Pack figures sum only measured rows; see preview-totals for why unmeasured files are counted apart.
import { useMemo } from 'react';
import { Box } from '@ds/primitives/Box';
import { EmptyState } from '@ds/primitives/EmptyState';
import { Text } from '@ds/primitives/Text';
import { formatBytes } from '@app/utils/formatBytes';
import { previewTotals } from './behavior/preview-totals';
import { CandidateRow } from './sub-components/CandidateRow';
import type { PreviewStepProps } from './PreviewStep.type';

/** `−1.2 MB` saved, or `+1.2 MB` if the pack grows. */
const netLabel = (net: number): string => (net < 0 ? `+${formatBytes(-net)}` : `−${formatBytes(net)}`);

const PreviewStep = (props: PreviewStepProps) => {
  const { analysis, convertibleCount } = props;
  const totals = useMemo(() => previewTotals(analysis.candidates), [analysis.candidates]);
  const net = totals.currentBytes - totals.estimatedBytes;

  if (analysis.candidates.length === 0) {
    return <EmptyState message="Every audio file in this pack is already in one format" />;
  }

  return (
    <Box className="msu-optimize__step">
      <Box className="detail-panel__grid">
        <Text className="detail-panel__label">Measured</Text>
        <Text className="detail-panel__value">
          {formatBytes(totals.currentBytes)} → {formatBytes(totals.estimatedBytes)}
          {' · '}
          <Text as="span" className={net < 0 ? 'msu-optimize__cell--bad' : undefined}>
            {netLabel(net)}
          </Text>
        </Text>

        <Text className="detail-panel__label">Converts</Text>
        <Text className="detail-panel__value">
          {convertibleCount} file{convertibleCount === 1 ? '' : 's'}
          {analysis.alreadyTargetCount > 0 && ` · ${analysis.alreadyTargetCount} already held in the target format`}
        </Text>

        {totals.growingCount > 0 && (
          <>
            <Text className="detail-panel__label">Grows</Text>
            <Text className="detail-panel__value">
              {totals.growingCount} already-compressed file{totals.growingCount === 1 ? '' : 's'} gets
              bigger. Lossless, so the audio itself is stored exactly as it decodes today.
            </Text>
          </>
        )}

        {(totals.unmeasuredCount > 0 || totals.excludedCount > 0) && (
          <>
            <Text className="detail-panel__label">Unmeasured</Text>
            <Text className="detail-panel__value">
              {totals.unmeasuredCount} with no measurable length
              {totals.excludedCount > 0 && ` · ${totals.excludedCount} no decoder can read`}
            </Text>
          </>
        )}
      </Box>

      <Box className="msu-optimize__rows">
        {analysis.candidates.map((row) => <CandidateRow key={row.name} row={row} />)}
      </Box>
    </Box>
  );
};

export { PreviewStep };
export type { PreviewStepProps };
