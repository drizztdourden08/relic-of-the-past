/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { Text } from '@ds/primitives/Text';
import { PIE_OPTIONS } from './CountdownContent.constants';
import type { HudCountdownVariantChoice } from '@shared/types/hud';
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
      <Text className="hud-editor__hint">Draws only while a countdown runs. The stage shows a sample.</Text>
    </Box>
  );
};

export { CountdownContent };
export type { CountdownContentProps } from './CountdownContent.type';
