/* @layer renderer-components @kind component */
/** A running install: its bar, the step it is on, and Cancel while the download runs. */
import { Button, Flex, ProgressBar, Stack, Text } from '@ds/primitives';
import type { InstallJob } from '../Store.type';
import { progressLine, progressRatio } from '../behavior/progress-text';

interface StoreInstallBarProps {
  job: InstallJob;
  onCancel: () => void;
}

const BAR_MAX = 1000;

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
