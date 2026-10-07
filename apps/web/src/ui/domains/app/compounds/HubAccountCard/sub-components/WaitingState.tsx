/* @layer renderer-components @kind component */
import { Button, Flex, Stack, Text } from '@ds/primitives';
import type { WaitingStateProps } from '../HubAccountCard.type';

const WaitingState = (props: WaitingStateProps) => {
  const { userCode, siteHost, onCancel } = props;

  return (
    <Flex align="center" justify="between" gap="md" className="hub-account">
      <Stack gap="xs">
        <Text as="p" className="hub-account__code">{userCode ?? '...'}</Text>
        <Text as="p" className="hub-account__lead">
          Your browser opened {siteHost}. Confirm this device there. Code valid 10 min.
        </Text>
      </Stack>
      <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    </Flex>
  );
};

export { WaitingState };
