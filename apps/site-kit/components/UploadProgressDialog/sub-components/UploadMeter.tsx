/* @layer site-kit @kind component */
import { Flex, ProgressBar, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { formatRate, formatTimeLeft } from '../../../upload/upload-format';
import type { UploadMeterProps } from './UploadMeter.type';

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
