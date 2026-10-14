/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { selectSlots } from './select-slots';
import { ROW_CAP } from './text-groups.constants';
import { NO_SLOTS } from './TextGroupsTab.constants';
import type { TextGroupsTabProps } from './TextGroupsTab.type';

const useTextSlots = (props: Pick<TextGroupsTabProps, 'groups' | 'activeGroup' | 'values'>) => {
  const { groups, activeGroup, values } = props;
  const [query, setQuery] = useState('');
  const [untranslatedOnly, setUntranslatedOnly] = useState(false);

  const group = useMemo(
    () => groups.find((one) => one.id === activeGroup) ?? null,
    [groups, activeGroup],
  );

  const matched = useMemo(
    () => (group === null ? NO_SLOTS : selectSlots(group, values, { query, untranslatedOnly })),
    [group, values, query, untranslatedOnly],
  );

  const drawn = useMemo(() => matched.slice(0, ROW_CAP), [matched]);

  const handleQuery = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.currentTarget.value);
  }, []);

  const total = group?.slots.length ?? 0;

  return {
    group, matched, drawn, query, handleQuery, untranslatedOnly, setUntranslatedOnly, total,
    hidden: matched.length - drawn.length,
    empty: group === null || total === 0,
  };
};

export { useTextSlots };
