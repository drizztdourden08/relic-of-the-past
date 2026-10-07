/* @layer renderer-components @kind component */
import { Button, Flex, Stack, Text } from '@ds/primitives';
import type { SignedOutStateProps } from '../SanctuaryAccountCard.type';

const SignedOutState = (props: SignedOutStateProps) => {
  const { lastError, onSignIn } = props;

  return (
    <Flex align="center" justify="between" gap="md" className="sanctuary-account">
      <Stack gap="xs">
        <Text as="p" className="sanctuary-account__lead">Sign in so bug reports carry your name and appear on the hub.</Text>
        {lastError && <Text as="p" className="sanctuary-account__error">{lastError}</Text>}
      </Stack>
      <Button variant="primary" onClick={onSignIn}>Sign in to the Sanctuary</Button>
    </Flex>
  );
};

export { SignedOutState };
