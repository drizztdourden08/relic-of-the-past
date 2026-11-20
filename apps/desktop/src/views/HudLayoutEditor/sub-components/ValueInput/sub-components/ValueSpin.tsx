/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Icon, Pressable } from '@drizztdourden08/tessera/primitives';
import type { ValueSpinProps } from './ValueSpin.type';

const ValueSpin = (props: ValueSpinProps) => {
  const t = useT();
  const { named, stepBy } = props;

  return (
    <Box className="hud-value-input__spin">
      <Pressable className="hud-value-input__step" tabIndex={-1} aria-label={t('hud-editor:value-input.increment', { name: named })} onClick={() => stepBy(1)}>
        <Icon size={12} name="chevron-up" />
      </Pressable>
      <Pressable className="hud-value-input__step" tabIndex={-1} aria-label={t('hud-editor:value-input.decrement', { name: named })} onClick={() => stepBy(-1)}>
        <Icon size={12} name="chevron-down" />
      </Pressable>
    </Box>
  );
};

export { ValueSpin };
