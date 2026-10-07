/* @layer site-kit @kind component */
/**
 * One step of the dialog's list: a spinner while it runs, a check once done, a cross when it
 * failed and a hollow circle while it waits, then its label and its short fact. `children`
 * is drawn under it (the upload step's meter).
 */
import type { ReactNode } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import checkIcon from '@iconify-icons/lucide/check';
import circleIcon from '@iconify-icons/lucide/circle';
import xIcon from '@iconify-icons/lucide/x';
import { Box } from '@ds/primitives/Box';
import { Flex } from '@ds/primitives/Flex';
import { Spinner } from '@ds/primitives/Spinner';
import { Text } from '@ds/primitives/Text';
import type { StepState, UploadStep } from '../../../upload/upload-job.type';

type StepRowProps = {
  step: UploadStep;
  children?: ReactNode;
};

const ICONS = { done: checkIcon, failed: xIcon, pending: circleIcon } as const;

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
export type { StepRowProps };
