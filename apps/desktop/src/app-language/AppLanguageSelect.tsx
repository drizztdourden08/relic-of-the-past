/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Select } from '@drizztdourden08/tessera/primitives';
import { APP_LANGUAGES } from './app-language.constants';
import { INHERIT } from './AppLanguageSelect.constants';
import type { AppLanguageSelectProps } from './AppLanguageSelect.type';

const AppLanguageSelect = ({ value, onChange, inherit = false }: AppLanguageSelectProps) => {
  const t = useT();
  const named = APP_LANGUAGES.map((choice) => ({ value: choice.tag, label: choice.name }));
  const options = inherit ? [{ value: INHERIT, label: t('common:appLanguage.useApp') }, ...named] : named;
  return <Select value={value} onChange={onChange} options={options} />;
};

export { AppLanguageSelect };
