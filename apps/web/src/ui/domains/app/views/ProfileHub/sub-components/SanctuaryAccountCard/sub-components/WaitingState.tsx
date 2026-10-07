/* @layer renderer-components @kind component */
import { Button, Flex, Stack, Text } from '@ds/primitives';
import { SANCTUARY_SITE_HOST } from '@app/lib/sanctuary/sanctuary-site';
import type { WaitingStateProps } from '../SanctuaryAccountCard.type';

const WaitingState = (props: WaitingStateProps) => {
  const { userCode, onCancel } = props;

  return (
    <Flex align="center" justify="between" gap="md" className="sanctuary-account">
      <Stack gap="xs">
        <Text as="p" className="sanctuary-account__code">{userCode ?? '...'}</Text>
        <Text as="p" className="sanctuary-account__lead">
          Your browser opened {SANCTUARY_SITE_HOST}. Confirm this device there. Code valid 10 min.
        </Text>
      </Stack>
      <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    </Flex>
  );
};

export { WaitingState };
