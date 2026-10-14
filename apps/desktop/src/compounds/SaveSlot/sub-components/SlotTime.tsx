/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { SlotTimeProps } from '../SaveSlot.type';

const SlotTime = ({ timestamp }: SlotTimeProps) => (
  <Text className="save-slot__time">
    {new Date(timestamp).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })}
  </Text>
);

export { SlotTime };
