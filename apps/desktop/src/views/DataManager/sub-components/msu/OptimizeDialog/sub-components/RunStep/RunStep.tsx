/* @layer renderer-components @kind component */
import { Box, ProgressBar, Text } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import type { RunStepProps } from './RunStep.type';

const convertedSoFar = (progress: RunStepProps['progress']): number =>
  (progress === null ? 0 : Math.max(0, progress.index - 1) + (progress.fileFraction ?? 0));

const RunStep = (props: RunStepProps) => {
  const { progress, result } = props;

  if (result === null) {
    const total = progress?.total ?? 0;
    return (
      <Box className="msu-optimize__step">
        <Text className="msu-optimize__note">
          {progress === null ? 'Starting...' : `Converting ${progress.fileName} (${progress.index} of ${total})`}
        </Text>
        <ProgressBar value={convertedSoFar(progress)} max={Math.max(1, total)} />
      </Box>
    );
  }

  const written = result.converted.reduce((sum, one) => sum + one.bytes, 0);

  return (
    <Box className="msu-optimize__step">
      <Box className="detail-panel__grid">
        <Text className="detail-panel__label">Repeat points</Text>
        <Text className="detail-panel__value">
          {result.loopPointsCarried} moved into the manifest before any format changed
        </Text>
        <Text className="detail-panel__label">Converted</Text>
        <Text className="detail-panel__value">
          {result.converted.length} file{result.converted.length === 1 ? '' : 's'} · {formatBytes(written)} written
        </Text>
        <Text className="detail-panel__label">Originals</Text>
        <Text className="detail-panel__value">
          Kept. Throw the superseded ones out from the pack&apos;s files when you are happy with the result.
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
