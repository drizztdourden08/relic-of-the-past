/* @layer renderer-components @kind component */
/**
 * Which HUD arrangement this control scheme wears.
 *
 * It sits on the controls screen instead of in the HUD settings because that
 * is where it belongs: the layout is a property of the SCHEME, so the keyboard
 * profile and the pad profile each name their own and switching between them
 * swaps the slot list, the assignments and the HUD in one step.
 *
 * Two schemes may name the same layout. The picker does not stop that, and it
 * should not: editing a shared layout edits it for both, and "save a copy" in
 * the editor is how one of them forks.
 */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Field } from '../../../../../../design-system/primitives/Field';
import { Select } from '../../../../../../design-system/primitives/Select';
import { Text } from '../../../../../../design-system/primitives/Text';
import type { HudLayout } from '@shared/types/hud';

interface SchemeLayoutRowProps {
  value: string;
  layouts: readonly HudLayout[];
  /** No modern block yet, so there is no scheme to hang a layout on. */
  disabled?: boolean;
  onChange: (layoutId: string) => void;
}

const SchemeLayoutRow = (props: SchemeLayoutRowProps) => {
  const { value, layouts, disabled = false, onChange } = props;

  const options = layouts.map((layout) => ({
    value: layout.id,
    label: layout.builtIn ? layout.name : `${layout.name} (custom)`,
  }));

  return (
    <Box className="modern-tab__layout">
      <Field
        label="HUD layout"
        hint="The arrangement this scheme wears. Switching control profile switches it too. Build your own in Advanced → HUD Layout Editor."
      >
        <Select
          value={value}
          options={options}
          placeholder="Default"
          disabled={disabled || options.length === 0}
          onChange={onChange}
        />
      </Field>
      {disabled && (
        <Text variant="caption" className="modern-tab__slots-hint">
          Assign a device to this profile first. A scheme with no slots has no HUD to arrange.
        </Text>
      )}
    </Box>
  );
};

export { SchemeLayoutRow };
export type { SchemeLayoutRowProps };
