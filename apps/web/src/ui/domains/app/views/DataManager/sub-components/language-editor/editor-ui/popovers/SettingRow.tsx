/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Select, Text } from '@drizztdourden08/tessera/primitives';
import type { SettingRowProps } from './SettingRow.type';

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
