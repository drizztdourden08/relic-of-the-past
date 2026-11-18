/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import type { FocusEvent } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { InlineCreateForm } from '@drizztdourden08/tessera/composites';
import { useT } from '@drizztdourden08/brock-react';
import { defaultSaveName } from '../default-save-name';
import type { CreateSaveFormProps } from '../home-tab.type';

const selectTyped = (event: FocusEvent<HTMLElement>) => {
  if (event.target instanceof HTMLInputElement) event.target.select();
};

const CreateSaveForm = ({ onCreate, onCancel }: CreateSaveFormProps) => {
  const t = useT();
  const name = useMemo(() => defaultSaveName(t), [t]);
  return (
    <Box onFocus={selectTyped}>
      <InlineCreateForm compact size="sm" defaultValue={name} label={t('profiles:home.create.name')} submitLabel={t('profiles:home.create.submit')} onCreate={onCreate} onCancel={onCancel} />
    </Box>
  );
};

export { CreateSaveForm };
