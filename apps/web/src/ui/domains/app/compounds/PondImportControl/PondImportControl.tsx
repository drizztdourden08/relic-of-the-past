/* @layer renderer-components @kind component */
import { Box, Button, Select, Text } from '@ds/primitives';
import type { SelectOption } from '@ds/primitives';
import { PLACEHOLDER } from './PondImportControl.constants';
import type { PondImportControlProps } from './PondImportControl.type';
import './PondImportControl.css';

const PondImportControl = (props: PondImportControlProps) => {
  const { sources, value, disabled = false, onValueChange, onImport } = props;
  const options: SelectOption[] = sources.map(({ id, label }) => ({ value: id, label }));

  return (
    <Box className="pond-import">
      <Text className="pond-import__label">copy settings from</Text>
      <Select
        size="sm"
        value={value}
        options={options}
        placeholder={PLACEHOLDER}
        disabled={disabled}
        onChange={onValueChange}
      />
      <Button size="sm" disabled={disabled || value === ''} onClick={onImport}>Copy</Button>
    </Box>
  );
};

export { PondImportControl };
