/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Field, Select, Text } from '@drizztdourden08/tessera/primitives';
import type { SchemeLayoutRowProps } from './controls.type';

const SchemeLayoutRow = (props: SchemeLayoutRowProps) => {
  const { value, layouts, disabled = false, onChange } = props;

  const options = useMemo(() => layouts.map((layout) => ({
    value: layout.id,
    label: layout.builtIn ? layout.name : `${layout.name} (custom)`,
  })), [layouts]);

  return (
    <Box className="modern-tab__layout">
      <Field
        label="HUD layout"
        hint="The arrangement this scheme wears. Switching control profile switches it too. Build your own in Advanced > HUD Layout Editor."
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
