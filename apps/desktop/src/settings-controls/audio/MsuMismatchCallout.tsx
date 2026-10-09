/* @layer renderer-components @kind component */
import { Card, Flex, Icon, Text } from '@drizztdourden08/tessera/primitives';
import type { MsuMismatchCalloutProps } from './MsuDetectedSummary.type';

const MsuMismatchCallout = (props: MsuMismatchCalloutProps) => {
  const { message } = props;
  return (
    <Card variant="danger">
      <Flex align="center" gap="sm">
        <Icon name="triangle-alert" />
        <Text variant="body">{message}</Text>
      </Flex>
    </Card>
  );
};

export { MsuMismatchCallout };
