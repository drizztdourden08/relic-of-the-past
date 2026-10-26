/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { OutlineHintProps } from './OutlineHint.type';

const OutlineHint = (props: OutlineHintProps) => {
  const { modifier } = props;

  return (
    <Text className="hud-editor__hint">
      Drag a row to move it, or move the focused row with {modifier} and the arrow keys. The
      screen itself cannot be moved.
    </Text>
  );
};

export { OutlineHint };
