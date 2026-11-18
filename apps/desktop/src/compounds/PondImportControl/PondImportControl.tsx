/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, Select, Text } from '@drizztdourden08/tessera/primitives';
import type { SelectOption } from '@drizztdourden08/tessera/primitives';
import { PLACEHOLDER } from './PondImportControl.constants';
import type { PondImportControlProps } from './PondImportControl.type';
import './PondImportControl.css';

const PondImportControl = (props: PondImportControlProps) => {
  const t = useT();
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
      <Button size="sm" disabled={disabled || value === ''} onClick={onImport}>{t('compounds:pond-import-control.copy')}</Button>
    </Box>
  );
};

export { PondImportControl };
