/* @layer renderer-components @kind component */
import { Card } from '../../../../../design-system/primitives/Card';
import { Text } from '../../../../../design-system/primitives/Text';
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
