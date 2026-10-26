/* @layer renderer-components @kind component */
import { Box, Field, SegmentedControl, Text } from '@drizztdourden08/tessera/primitives';
import { PIE_OPTIONS } from './CountdownContent.constants';
import type { HudCountdownVariantChoice } from '@rotp/hud';
import type { CountdownContentProps } from './CountdownContent.type';

const CountdownContent = (props: CountdownContentProps) => {
  const { spec, onChange } = props;
  const pick = (variant: HudCountdownVariantChoice): void =>
    onChange({ variant: variant === 'setting' ? undefined : variant });

  return (
    <Box className="hud-inspect__group">
      <Field size="sm" label="pie">
        <SegmentedControl size="sm" value={spec.variant ?? 'setting'} options={PIE_OPTIONS} onChange={pick} />
      </Field>
      <Text className="hud-editor__hint">Draws only while a countdown runs.</Text>
    </Box>
  );
};

export { CountdownContent };
