/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { all } from '@rotp/game-data';
import { menuTextFor } from '@app/storage/menu-text-store';
import { buildGroups } from '@rotp/languages';
import type { LanguageSet, TextGroupId } from '@rotp/languages';
import type { DecodedText } from '@app/storage/menu-text-store';
import { FIRST_GROUP, NO_LINES, NO_VALUES } from './useTextGroups.constants';
import type { TextGroupsState } from './useTextGroups.type';

const useTextGroups = (
  set: LanguageSet | null,
  onChangeValue: (group: TextGroupId, key: string, value: string) => void,
): TextGroupsState => {
  const [activeGroup, setActiveGroup] = useState<TextGroupId>(FIRST_GROUP);
  const [decoded, setDecoded] = useState<DecodedText | null>(null);

  const base = set?.base ?? null;
  useEffect(() => {
    if (base === null) return undefined;
    let live = true;
    setDecoded(null);
    void menuTextFor(base).then((lines) => { if (live) setDecoded(lines); });
    return () => { live = false; };
  }, [base]);

  const menu = decoded?.menu ?? NO_LINES;
  const credits = decoded?.credits ?? NO_LINES;
  const decodedNote = decoded !== null && base !== null && decoded.language !== base
    ? `Shown from the ${decoded.language} file, the only one stored. Not this set's own words.`
    : undefined;

  const groups = useMemo(
    () => buildGroups({ menu, credits, records: all, decodedNote }),
    [menu, credits, decodedNote],
  );

  const values = set?.text?.[activeGroup] ?? NO_VALUES;

  const setValue = useCallback((key: string, value: string) => {
    onChangeValue(activeGroup, key, value);
  }, [activeGroup, onChangeValue]);

  return { groups, activeGroup, values, selectGroup: setActiveGroup, setValue };
};

export { useTextGroups };
