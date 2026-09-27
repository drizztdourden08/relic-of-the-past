/* @layer renderer-components @kind component */
import { Button, Flex, Stack, Text } from '@ds/primitives';
import type { SignedOutStateProps } from '../HubAccountCard.type';

const SignedOutState = (props: SignedOutStateProps) => {
  const { lastError, lead, signInLabel, onSignIn } = props;

  return (
    <Flex align="center" justify="between" gap="md" className="hub-account">
      <Stack gap="xs">
        <Text as="p" className="hub-account__lead">{lead}</Text>
        {lastError && <Text as="p" className="hub-account__error">{lastError}</Text>}
      </Stack>
      <Button variant="primary" onClick={onSignIn}>{signInLabel}</Button>
    </Flex>
  );
};

export { SignedOutState };
