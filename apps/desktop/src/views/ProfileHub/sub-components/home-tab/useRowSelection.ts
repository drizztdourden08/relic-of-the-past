/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { RowSelection } from './home-tab.type';

const useRowSelection = (ids: readonly string[]): RowSelection => {
  const [picked, setPicked] = useState<string | null>(null);
  const selectedId = picked !== null && ids.includes(picked) ? picked : null;
  const tabStop = selectedId ?? ids[0];
  const tabIndexOf = useCallback((id: string) => (id === tabStop ? 0 : -1), [tabStop]);
  return useMemo(() => ({ selectedId, select: setPicked, tabIndexOf }), [selectedId, tabIndexOf]);
};

export { useRowSelection };
