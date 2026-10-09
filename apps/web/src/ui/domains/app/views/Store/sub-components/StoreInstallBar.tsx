/* @layer renderer-components @kind component */
import { Button, Flex, ProgressBar, Stack, Text } from '@drizztdourden08/tessera/primitives';
import type { StoreInstallBarProps } from '../Store.type';
import { BAR_MAX } from '../Store.constants';
import { progressLine } from '../behavior/progress-line';
import { progressRatio } from '../behavior/progress-ratio';

const StoreInstallBar = (props: StoreInstallBarProps) => {
  const { job, onCancel } = props;
  const { progress } = job;
  const canCancel = !progress || progress.phase === 'download';

  return (
    <Stack gap="xs" className="store-install-bar">
      <Text as="span" className="store__label">Installing</Text>
      <ProgressBar value={Math.round(progressRatio(progress) * BAR_MAX)} max={BAR_MAX} live={progress?.phase === 'download'} />
      <Flex align="center" justify="between" gap="sm">
        <Text as="span" className="store__hint">{progressLine(progress)}</Text>
        {canCancel && <Button variant="tertiary" size="sm" onClick={onCancel}>Cancel</Button>}
      </Flex>
    </Stack>
  );
};

export { StoreInstallBar };
