/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { all } from '@rotp/game-data';
import { buildGroups } from '@rotp/languages';
import type { LanguageSet, TextGroupId } from '@rotp/languages';
import { FIRST_GROUP, NO_VALUES } from './text-groups.constants';
import type { TextGroupsState } from './text-groups.type';
import { useDecodedMenu } from './useDecodedMenu';

const useTextGroups = (
  set: LanguageSet | null,
  onChangeValue: (group: TextGroupId, key: string, value: string) => void,
): TextGroupsState => {
  const [activeGroup, setActiveGroup] = useState<TextGroupId>(FIRST_GROUP);
  const { menu, credits, decodedNote } = useDecodedMenu(set?.base ?? null);

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
