/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { DateText } from '@drizztdourden08/tessera/composites';
import type { SlotTimeProps } from '../SaveSlot.type';

const SlotTime = ({ timestamp }: SlotTimeProps) => (
  <Text className="save-slot__time">
    <DateText value={timestamp} format="datetime" />
  </Text>
);

export { SlotTime };
