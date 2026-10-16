/* @layer renderer-components @kind component */
import { Button, Card, Stack, Text } from '@drizztdourden08/tessera/primitives';
import type { WaitingStateProps } from '../HubAccountCard.type';

const WaitingState = (props: WaitingStateProps) => {
  const { userCode, siteHost, onCancel } = props;

  return (
    <Card className="hub-account">
      <Stack gap="sm" align="start">
        <Text as="p" className="hub-account__code">{userCode ?? '...'}</Text>
        <Text as="p" className="hub-account__lead">
          Your browser opened {siteHost}. Confirm this device there. Code valid 10 min.
        </Text>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </Stack>
    </Card>
  );
};

export { WaitingState };
