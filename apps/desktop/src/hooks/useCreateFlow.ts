/* @layer renderer-other @kind hook */
import { useCallback, useState } from 'react';
import type { CreateFlowParams } from './use-create-flow.type';

const useCreateFlow = ({ onSelect }: CreateFlowParams) => {
  const [creating, setCreating] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);

  const start = useCallback(() => {
    setCreating(true);
    setListCollapsed(true);
  }, []);

  const cancel = useCallback(() => {
    setCreating(false);
    setListCollapsed(false);
  }, []);

  const select = useCallback((id: string) => {
    onSelect(id);
    cancel();
  }, [onSelect, cancel]);

  return { creating, start, cancel, select, listCollapsed, setListCollapsed };
};

export { useCreateFlow };
