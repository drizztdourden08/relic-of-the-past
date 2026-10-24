/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';

const InstructionsPanel = () => (
  <Text as="p" className="hid-cal__desc">Hold an input and bind the byte that changes. Click a noisy byte to exclude it.</Text>
);

export { InstructionsPanel };
