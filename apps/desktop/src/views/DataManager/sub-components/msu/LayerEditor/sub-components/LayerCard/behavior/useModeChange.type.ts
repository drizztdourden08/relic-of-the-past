/* @layer renderer-components @kind types */
import type { MsuLayer } from '@rotp/game-data';
import type { ConfirmRequest } from '../../../LayerEditor.type';

interface ModeChangeParams {
  layer: MsuLayer;
  onConfirm: ConfirmRequest;
  onChange: (patch: Partial<Omit<MsuLayer, 'id'>>) => void;
}

export type { ModeChangeParams };
