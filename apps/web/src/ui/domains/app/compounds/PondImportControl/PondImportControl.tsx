/* @layer renderer-components @kind component */
/**
 * Copy another pond's settings onto the one on screen: pick a pond, then
 * press. Two steps on purpose, because the copy overwrites everything the tab
 * holds and a dropdown that acted the moment it changed would do that on a
 * mis-click. Bare: the sources arrive named and the copy itself is the view's.
 */
import { Box, Button, Select, Text } from '@ds/primitives';
import type { SelectOption } from '@ds/primitives';
import type { PondImportControlProps } from './PondImportControl.type';
import './PondImportControl.css';

const PLACEHOLDER = 'Pick a pond';

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
