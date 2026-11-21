/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, ProgressBar, Text } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import type { RunStepProps } from './RunStep.type';

const convertedSoFar = (progress: RunStepProps['progress']): number =>
  (progress === null ? 0 : Math.max(0, progress.index - 1) + (progress.fileFraction ?? 0));

const RunStep = (props: RunStepProps) => {
  const { progress, result } = props;
  const t = useT();

  if (result === null) {
    const total = progress?.total ?? 0;
    return (
      <Box className="msu-optimize__step">
        <Text className="msu-optimize__note">
          {progress === null
            ? t('msu-studio:optimize.starting')
            : t('msu-studio:optimize.converting-file', { name: progress.fileName, index: progress.index, total })}
        </Text>
        <ProgressBar value={convertedSoFar(progress)} max={Math.max(1, total)} />
      </Box>
    );
  }

  const written = result.converted.reduce((sum, one) => sum + one.bytes, 0);

  return (
    <Box className="msu-optimize__step">
      <Box className="detail-panel__grid">
        <Text className="detail-panel__label">{t('msu-studio:optimize.result.repeat')}</Text>
        <Text className="detail-panel__value">
          {t('msu-studio:optimize.result.repeat-value', { count: result.loopPointsCarried })}
        </Text>
        <Text className="detail-panel__label">{t('msu-studio:optimize.result.converted')}</Text>
        <Text className="detail-panel__value">
          {t('msu-studio:optimize.result.converted-value', { count: result.converted.length, size: formatBytes(written) })}
        </Text>
        <Text className="detail-panel__label">{t('msu-studio:optimize.result.originals')}</Text>
        <Text className="detail-panel__value">
          {t('msu-studio:optimize.result.originals-value')}
        </Text>
      </Box>

      {result.failed.length > 0 && (
        <Box className="msu-optimize__rows">
          {result.failed.map((one) => (
            <Box key={one.name} className="msu-optimize__row">
              <Text className="msu-optimize__row-name" title={one.name}>{one.name}</Text>
              <Text className="msu-optimize__cell msu-optimize__cell--bad" title={one.reason}>{one.reason}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export { RunStep };
