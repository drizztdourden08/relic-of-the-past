/* @layer site-kit @kind component */
/** Under the running upload step: the bar, then the speed and the time left once known. */
import { Flex } from '@ds/primitives/Flex';
import { ProgressBar } from '@ds/primitives/ProgressBar';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { formatRate, formatTimeLeft } from '../../../upload/upload-format';
import type { UploadJob } from '../../../upload/upload-job.type';

type UploadMeterProps = { job: UploadJob };

const UploadMeter = (props: UploadMeterProps) => {
  const { job } = props;
  const { sent, bytes, bytesPerSecond, msLeft } = job;
  const percent = bytes > 0 ? (sent / bytes) * 100 : 0;
  return (
    <Stack gap="xs" align="stretch" className="upload-dialog__meter">
      <ProgressBar value={percent} live />
      <Flex align="baseline" gap="sm" justify="between">
        <Text as="span" className="upload-dialog__numbers">{bytesPerSecond ? formatRate(bytesPerSecond) : ''}</Text>
        <Text as="span" className="upload-dialog__numbers">{msLeft !== null ? `about ${formatTimeLeft(msLeft)}` : ''}</Text>
      </Flex>
    </Stack>
  );
};

export { UploadMeter };
export type { UploadMeterProps };
