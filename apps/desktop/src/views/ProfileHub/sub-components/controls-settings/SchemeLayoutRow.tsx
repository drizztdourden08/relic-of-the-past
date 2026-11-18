/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { Box, Field, Select, Text } from '@drizztdourden08/tessera/primitives';
import type { SchemeLayoutRowProps } from './slots-footer.type';

const SchemeLayoutRow = (props: SchemeLayoutRowProps) => {
  const { value, layouts, disabled = false, onChange } = props;
  const t = useT();

  const options = useMemo(() => layouts.map((layout) => ({
    value: layout.id,
    label: layout.builtIn ? layout.name : t('profiles:controls.layout.custom', { name: layout.name }),
  })), [layouts, t]);

  return (
    <Box className="modern-tab__layout">
      <Field
        label={t('profiles:controls.layout.label')}
        hint={t('profiles:controls.layout.hint')}
      >
        <Select
          value={value}
          options={options}
          placeholder={t('profiles:controls.layout.placeholder')}
          disabled={disabled || options.length === 0}
          onChange={onChange}
        />
      </Field>
      {disabled && (
        <Text variant="caption" className="modern-tab__slots-hint">
          {t('profiles:controls.layout.no-device')}
        </Text>
      )}
    </Box>
  );
};

export { SchemeLayoutRow };
