/* @layer renderer-components @kind component */
import { AppLanguageSelect } from './AppLanguageSelect';
import { useAppLanguageStore } from './useAppLanguageStore';

const GlobalAppLanguageControl = () => {
  const language = useAppLanguageStore((s) => s.language);
  const setLanguage = useAppLanguageStore((s) => s.setLanguage);
  return <AppLanguageSelect value={language} onChange={setLanguage} />;
};

export { GlobalAppLanguageControl };
