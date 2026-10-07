/* @layer renderer-components @kind component */
/**
 * One message-wide setting as a label and a short list of values. Its own
 * component so the change handler is bound once per setting, and so one handler
 * upstream serves all three by taking the code name back with the value.
 */
import { useCallback } from 'react';
import { Box, Select, Text } from '@ds/primitives';
import type { SettingField } from './settings-fields';

type SettingRowProps = {
  field: SettingField;
  /** Empty string means "automatic", so the code is not present at all. */
  value: string;
  onChange: (name: string, value: string) => void;
};

const SettingRow = (props: SettingRowProps) => {
  const { field, value, onChange } = props;

  const handleChange = useCallback((next: string) => {
    onChange(field.name, next);
  }, [field.name, onChange]);

  return (
    <Box className="settings-popover__row" title={field.description}>
      <Text as="span" className="settings-popover__row-label" variant="caption">
        {field.label}
      </Text>
      <Select
        className="settings-popover__row-pick"
        size="sm"
        value={value}
        options={field.options}
        onChange={handleChange}
      />
    </Box>
  );
};

export { SettingRow };
export type { SettingRowProps };
