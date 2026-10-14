/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { OutlineHintProps } from './OutlineHint.type';

const OutlineHint = (props: OutlineHintProps) => {
  const { modifier } = props;

  return (
    <Text className="hud-editor__hint">
      Drag a row onto the top or bottom edge of another to sit beside it, or onto a
      container&apos;s middle to put it inside. The upper half goes first in that container,
      the lower half last. Or move the focused row with {modifier} and the arrow keys, and
      right-click it for the same four in words. Only the screen itself cannot be moved; it is
      the box everything else sits in.
    </Text>
  );
};

export { OutlineHint };
