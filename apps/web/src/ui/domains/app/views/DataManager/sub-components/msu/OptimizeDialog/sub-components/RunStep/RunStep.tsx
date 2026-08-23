/* @layer renderer-components @kind component */
/**
 * The run: which file is being encoded, and what the whole thing came to.
 *
 * The repeat-point count is reported first because it is the part that had to happen before any
 * format changed — a loop position lives in the file's own container and dies with it, so it is
 * written into the manifest up front, and saying how many moved is how that is verifiable.
 *
 * Originals are kept, and the summary says so: the pack is now holding both halves until the
 * superseded ones are thrown out from its files list.
 */
import { Box } from '@ds/primitives/Box';
import { ProgressBar } from '@ds/primitives/ProgressBar';
import { Text } from '@ds/primitives/Text';
import { formatBytes } from '@app/utils/formatBytes';
import type { RunStepProps } from './RunStep.type';

const RunStep = (props: RunStepProps) => {
  const { progress, result } = props;

  if (result === null) {
    const done = progress?.index ?? 0;
    const total = progress?.total ?? 0;
    return (
      <Box className="msu-optimize__step">
        <Text className="msu-optimize__note">
          {progress === null ? 'Starting…' : `Converting ${progress.fileName} — ${done} of ${total}`}
        </Text>
        <ProgressBar value={done} max={Math.max(1, total)} />
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
export type { RunStepProps };
