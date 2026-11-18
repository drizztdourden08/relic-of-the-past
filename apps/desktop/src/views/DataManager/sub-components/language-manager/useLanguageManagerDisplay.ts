/* @layer renderer-components @kind hook */
import { useT } from '@drizztdourden08/brock-react';
import { useCallback, useMemo } from 'react';
import type { LanguageSetSummary } from '@rotp/languages';
import { languageNames } from '../language-names.constants';
import type { LanguageManagerDisplayParams } from './language-manager.type';

const useLanguageManagerDisplay = ({ languages, packFor }: LanguageManagerDisplayParams) => {
  const t = useT();
  const setLabel = useCallback(
    (set: LanguageSetSummary) => (set.origin === 'rom' ? languageNames(t)[set.id] ?? set.name : set.name),
    [t],
  );
  const isInstalled = useCallback((code: string) => packFor(code) !== null, [packFor]);
  const ownSets = useMemo(() => languages.filter((set) => !isInstalled(set.id)), [languages, isInstalled]);

  return { setLabel, isInstalled, ownSets };
};

export { useLanguageManagerDisplay };
