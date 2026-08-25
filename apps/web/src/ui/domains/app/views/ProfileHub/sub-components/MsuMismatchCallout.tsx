/* @layer renderer-components @kind component */
/** Warns that manual audio settings disagree with the chosen pack format, so music will play
 *  at the wrong speed — the condition the old core only ever reported to stderr. */
import { Card } from '../../../../../design-system/primitives/Card';
import { Text } from '../../../../../design-system/primitives/Text';

interface MsuMismatchCalloutProps {
  message: string;
}

const MsuMismatchCallout = (props: MsuMismatchCalloutProps) => {
  const { message } = props;
  return (
    <Card variant="danger">
      <Text variant="body">⚠ {message}</Text>
    </Card>
  );
};

export { MsuMismatchCallout };
