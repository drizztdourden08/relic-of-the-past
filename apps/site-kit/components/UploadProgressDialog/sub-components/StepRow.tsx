/* @layer site-kit @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box, Flex, Spinner, Text } from '@drizztdourden08/tessera/primitives';
import type { StepState } from '../../../upload/upload-job.type';
import { ICONS } from './StepRow.constants';
import type { StepRowProps } from './StepRow.type';

const markOf = (state: StepState) =>
  (state === 'running' ? <Spinner size="sm" /> : <IconifyIcon icon={ICONS[state]} />);

const StepRow = (props: StepRowProps) => {
  const { step, children } = props;
  return (
    <Box as="li" className="upload-dialog__step" data-state={step.state}>
      <Flex align="center" gap="sm">
        <Flex align="center" justify="center" className="upload-dialog__mark">{markOf(step.state)}</Flex>
        <Text as="span" className="upload-dialog__label">{step.label}</Text>
        {step.detail && <Text as="span" className="upload-dialog__detail">{step.detail}</Text>}
      </Flex>
      {children}
    </Box>
  );
};

export { StepRow };
