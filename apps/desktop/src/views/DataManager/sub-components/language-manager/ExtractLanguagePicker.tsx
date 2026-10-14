/* @layer renderer-components @kind component */
import { Box, Select, Field } from '@drizztdourden08/tessera/primitives';
import { LANGUAGE_OPTIONS } from '../LanguageManager.constants';
import type { ExtractLanguagePickerProps } from './language-manager.type';
import './ExtractLanguagePicker.css';

const ExtractLanguagePicker = (props: ExtractLanguagePickerProps) => {
  const { value, onChange } = props;

  return (
    <Box className="import-form language-extract-picker">
      <Field label="Language">
        <Select
          value={value}
          onChange={onChange}
          options={LANGUAGE_OPTIONS}
          placeholder="Select language..."
        />
      </Field>
    </Box>
  );
};

export { ExtractLanguagePicker };
