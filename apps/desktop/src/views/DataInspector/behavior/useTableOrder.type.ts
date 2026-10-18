/* @layer renderer-app @kind types */
import type { InspectorKind, TableOrder } from '../DataInspector.type';

interface OrderState {
  kind: InspectorKind;
  order: TableOrder;
}

export type { OrderState };
