/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { Box, EmptyState, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import { previewTotals } from './behavior/preview-totals';
import { CandidateRow } from './sub-components/CandidateRow';
import type { PreviewStepProps } from './PreviewStep.type';

const netLabel = (net: number): string => (net < 0 ? `+${formatBytes(-net)}` : `−${formatBytes(net)}`);

const PreviewStep = (props: PreviewStepProps) => {
  const { analysis, convertibleCount } = props;
  const t = useT();
  const totals = useMemo(() => previewTotals(analysis.candidates), [analysis.candidates]);
  const net = totals.currentBytes - totals.estimatedBytes;

  if (analysis.candidates.length === 0) {
    return <EmptyState message={t('msu-studio:optimize.empty')} />;
  }

  return (
    <Box className="msu-optimize__step">
      <Box className="detail-panel__grid">
        <Text className="detail-panel__label">{t('msu-studio:optimize.measured')}</Text>
        <Text className="detail-panel__value">
          {formatBytes(totals.currentBytes)} <Icon name="arrow-right" inline /> {formatBytes(totals.estimatedBytes)}
          {' · '}
          <Text as="span" className={net < 0 ? 'msu-optimize__cell--bad' : undefined}>
            {netLabel(net)}
          </Text>
        </Text>

        <Text className="detail-panel__label">{t('msu-studio:optimize.converts')}</Text>
        <Text className="detail-panel__value">
          {analysis.alreadyTargetCount > 0
            ? t('msu-studio:optimize.converts.value-target', { count: convertibleCount, already: analysis.alreadyTargetCount })
            : t('msu-studio:optimize.converts.value', { count: convertibleCount })}
        </Text>

        {totals.growingCount > 0 && (
          <>
            <Text className="detail-panel__label">{t('msu-studio:optimize.grows')}</Text>
            <Text className="detail-panel__value">
              {t('msu-studio:optimize.grows.value', { count: totals.growingCount })}
            </Text>
          </>
        )}

        {(totals.unmeasuredCount > 0 || totals.excludedCount > 0) && (
          <>
            <Text className="detail-panel__label">{t('msu-studio:optimize.unmeasured')}</Text>
            <Text className="detail-panel__value">
              {totals.excludedCount > 0
                ? t('msu-studio:optimize.unmeasured.value-excluded', { count: totals.unmeasuredCount, excluded: totals.excludedCount })
                : t('msu-studio:optimize.unmeasured.value', { count: totals.unmeasuredCount })}
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
