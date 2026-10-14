/* @layer renderer-components @kind component */
import { Box, Icon, Pressable } from '@drizztdourden08/tessera/primitives';
import type { ValueSpinProps } from './ValueSpin.type';

const ValueSpin = (props: ValueSpinProps) => {
  const { named, stepBy } = props;

  return (
    <Box className="hud-value-input__spin">
      <Pressable tabIndex={-1} aria-label={`Increment ${named}`} onClick={() => stepBy(1)}>
        <Icon size={12} name="chevron-up" />
      </Pressable>
      <Pressable tabIndex={-1} aria-label={`Decrement ${named}`} onClick={() => stepBy(-1)}>
        <Icon size={12} name="chevron-down" />
      </Pressable>
    </Box>
  );
};

export { ValueSpin };
