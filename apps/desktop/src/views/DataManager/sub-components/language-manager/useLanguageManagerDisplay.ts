/* @layer renderer-components @kind hook */
import { useCallback, useMemo } from 'react';
import type { LanguageSetSummary } from '@rotp/languages';
import { LANGUAGE_NAMES } from '../language-names.constants';
import type { LanguageManagerDisplayParams } from './language-manager.type';

const useLanguageManagerDisplay = ({ languages, packFor }: LanguageManagerDisplayParams) => {
  const setLabel = useCallback(
    (set: LanguageSetSummary) => (set.origin === 'rom' ? LANGUAGE_NAMES[set.id] ?? set.name : set.name),
    [],
  );
  const isInstalled = useCallback((code: string) => packFor(code) !== null, [packFor]);
  const ownSets = useMemo(() => languages.filter((set) => !isInstalled(set.id)), [languages, isInstalled]);

  return { setLabel, isInstalled, ownSets };
};

export { useLanguageManagerDisplay };
