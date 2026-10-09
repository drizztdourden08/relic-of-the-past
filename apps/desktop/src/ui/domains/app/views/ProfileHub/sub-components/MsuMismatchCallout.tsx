/* @layer renderer-components @kind component */
import { Card, Text } from '@drizztdourden08/tessera/primitives';
import type { MsuMismatchCalloutProps } from './MsuDetectedSummary.type';

const MsuMismatchCallout = (props: MsuMismatchCalloutProps) => {
  const { message } = props;
  return (
    <Card variant="danger">
      <Text variant="body">⚠ {message}</Text>
    </Card>
  );
};

export { MsuMismatchCallout };
