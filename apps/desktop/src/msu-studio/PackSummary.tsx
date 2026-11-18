/* @layer renderer-components @kind component */
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import { useT } from '@drizztdourden08/brock-react';
import type { PackSummaryProps } from './PackSummary.type';

const PackSummary = (props: PackSummaryProps) => {
  const {
    fileCount, totalSize, formats, unusedCount, supersededCount, supersededBytes,
    optimizeBlockedBecause, busy, onOptimize, onRemoveSuperseded,
  } = props;
  const t = useT();
  const breakdown = formats.map((format) => `${format.count} ${format.ext}`).join(', ');

  return (
    <Box className="msu-file-summary">
      <Box className="detail-panel__grid">
        <Text className="detail-panel__label">{t('msu-studio:files.summary.files')}</Text>
        <Text className="detail-panel__value">{fileCount} · {formatBytes(totalSize)}</Text>
        <Text className="detail-panel__label">{t('msu-studio:files.summary.formats')}</Text>
        <Text className="detail-panel__value">{breakdown.length > 0 ? breakdown : '-'}</Text>
        <Text className="detail-panel__label">{t('msu-studio:files.summary.unused')}</Text>
        <Text className="detail-panel__value">
          {unusedCount === 0
            ? t('msu-studio:files.summary.none')
            : t('msu-studio:files.summary.unused-value', { count: unusedCount })}
        </Text>
        {supersededCount > 0 && (
          <>
            <Text className="detail-panel__label">{t('msu-studio:files.summary.superseded')}</Text>
            <Text className="detail-panel__value">
              {t('msu-studio:files.summary.superseded-value', { count: supersededCount, size: formatBytes(supersededBytes) })}
            </Text>
          </>
        )}
      </Box>

      <Box className="msu-file-summary__actions">
        <Button variant="secondary" size="sm" disabled={busy || optimizeBlockedBecause !== null} onClick={onOptimize}>
          {t('msu-studio:files.summary.optimize')}
        </Button>
        {supersededCount > 0 && (
          <Button variant="danger" size="sm" disabled={busy} onClick={onRemoveSuperseded}>
            {t('msu-studio:files.summary.remove-superseded', { count: supersededCount })}
          </Button>
        )}
      </Box>
      {optimizeBlockedBecause !== null && <Text variant="caption" tone="muted">{optimizeBlockedBecause}</Text>}
    </Box>
  );
};

export { PackSummary };
