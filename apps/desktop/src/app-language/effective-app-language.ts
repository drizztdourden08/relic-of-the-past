/* @layer renderer-lib @kind logic */
import { useProfilesStore } from '@drizztdourden08/brock-react';
import { isAppLanguage } from './is-app-language';
import { useAppLanguageStore } from './useAppLanguageStore';

const effectiveAppLanguage = (): string => {
  const override = useProfilesStore.getState().active?.appLanguage;
  return isAppLanguage(override) ? override : useAppLanguageStore.getState().language;
};

export { effectiveAppLanguage };
