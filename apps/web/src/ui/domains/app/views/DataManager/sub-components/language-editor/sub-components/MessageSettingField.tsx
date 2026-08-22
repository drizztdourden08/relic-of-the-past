/* @layer renderer-components @kind component */
/**
 * One message-wide display setting as a labelled picker.
 *
 * The values offered are the ones this language can bake, so the field cannot
 * express an unencodable choice; the extra "automatic" entry means "say
 * nothing", which takes the code out and lets the engine default stand.
 */
import { useCallback } from 'react';
import { Box, Select, Text } from '@ds/primitives';
import type { SelectOption } from '@ds/primitives';

type MessageSettingFieldProps = {
  /** Catalog code name, reported back so one handler serves every field. */
  name: string;
  label: string;
  description: string;
  /** Empty string means "automatic" — no code present. */
  value: string;
  options: SelectOption[];
  onChange: (name: string, value: string) => void;
};

const MessageSettingField = (props: MessageSettingFieldProps) => {
  const { name, label, description, value, options, onChange } = props;

  const handleChange = useCallback((next: string) => onChange(name, next), [name, onChange]);

  return (
    <Box className="entry-editor__setting" title={description}>
      <Text className="entry-editor__setting-label" variant="caption">{label}</Text>
      <Select
        className="entry-editor__setting-pick"
        size="sm"
        value={value}
        options={options}
        onChange={handleChange}
      />
    </Box>
  );
};

export { MessageSettingField };
export type { MessageSettingFieldProps };
