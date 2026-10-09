/* @layer renderer-components @kind types */
import type { MsuLayer } from '@shared/types/msu-manifest';
import type { ConfirmRequest } from '../../../LayerEditor.type';

interface ModeChangeParams {
  layer: MsuLayer;
  onConfirm: ConfirmRequest;
  onChange: (patch: Partial<Omit<MsuLayer, 'id'>>) => void;
}

export type { ModeChangeParams };
