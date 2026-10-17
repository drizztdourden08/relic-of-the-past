/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import type { ArmedAction } from '@app/compounds/ArmedActionButton';
import type { ArmedRow } from './home-tab.type';

const useArmedRow = () => {
  const [armedRow, setArmedRow] = useState<ArmedRow | null>(null);

  const reportArmed = useCallback((id: string, action: ArmedAction | null) => {
    setArmedRow((current) => {
      if (action) return current?.id === id && current.action === action ? current : { id, action };
      return current?.id === id ? null : current;
    });
  }, []);

  const armedOf = useCallback((id: string) => (armedRow?.id === id ? armedRow.action : null), [armedRow]);

  return { armedOf, reportArmed };
};

export { useArmedRow };
