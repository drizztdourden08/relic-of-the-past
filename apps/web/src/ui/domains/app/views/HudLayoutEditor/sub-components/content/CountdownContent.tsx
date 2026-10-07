/* @layer renderer-components @kind component */
/**
 * `countdown` has one choice of its own: which pie it draws (§62). `profile`
 * follows the HUD setting every player already has (Countdown Timer); `pixel`
 * and `smooth` pin this node to one pie whatever the setting says.
 *
 * ONE CONCERN, ONE ROW (§58). Pressing a segment changes the lit segment and
 * nothing else in this section: the hint under it is the same sentence for all
 * three, so the section keeps its shape whatever is pressed.
 */
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { Text } from '@ds/primitives/Text';
import type { HudCountdownSpec, HudCountdownVariantChoice } from '@shared/types/hud';

interface CountdownContentProps {
  spec: HudCountdownSpec;
  onChange: (patch: Partial<HudCountdownSpec>) => void;
}

const PIE_OPTIONS: { value: HudCountdownVariantChoice; label: string; title: string }[] = [
  { value: 'setting', label: 'profile', title: 'Follow the Countdown Timer setting' },
  { value: 'pixel', label: 'pixel', title: 'Always the pixel pie' },
  { value: 'smooth', label: 'smooth', title: 'Always the smooth pie' },
];

const CountdownContent = (props: CountdownContentProps) => {
  const { spec, onChange } = props;
  // `'setting'` is written back as an absent key, so a node that follows the
  // profile reads the same in a saved file whether it was inserted or reset.
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
export type { CountdownContentProps };
