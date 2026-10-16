/* @layer renderer-app @kind hook */
import { useMemo, useState } from 'react';
import { useViewStorage } from '@drizztdourden08/tessera/data';
import type { ViewStorage } from '@drizztdourden08/tessera/data';
import { NO_ORDER } from '../DataInspector.constants';
import type { InspectorKind, TableOrder } from '../DataInspector.type';
import { observeViewStorage } from './observe-view-storage';
import { orderOf, sameOrder } from './table-order';
import { tableViewKey } from './table-view-key';

interface OrderState {
  kind: InspectorKind;
  order: TableOrder;
}

const useTableOrder = (kind: InspectorKind): { order: TableOrder; storage: ViewStorage } => {
  const base = useViewStorage();
  const [state, setState] = useState<OrderState>({ kind, order: NO_ORDER });

  const storage = useMemo(
    () => observeViewStorage(base, tableViewKey(kind), (snapshot) => {
      const next = orderOf(snapshot);
      setState(prev => (prev.kind === kind && sameOrder(prev.order, next) ? prev : { kind, order: next }));
    }),
    [base, kind],
  );

  return { order: state.kind === kind ? state.order : NO_ORDER, storage };
};

export { useTableOrder };
