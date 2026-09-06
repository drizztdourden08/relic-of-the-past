/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { MsuLayer } from '@shared/types/msu-manifest';
import type { ConfirmRequest } from '../../LayerEditor.type';

interface LayerCardProps {
  layer: MsuLayer;
  index: number;
  /** How many layers the slot has, so the card knows whether it can move down. */
  total: number;
  /** Every audio file the pack holds. */
  available: string[];
  disabled?: boolean;
  /** Live preview readout, supplied ready-made so the card stays presentational while it redraws. */
  live?: ReactNode;
  /** What this layer's own file declares as its loop point, when the manifest sets none. */
  fileLoopSample: number | null;
  /** Confirm dialog asked before an order change discards files; see `useModeChange`. */
  onConfirm: ConfirmRequest;
  onChange: (patch: Partial<Omit<MsuLayer, 'id'>>) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}

export type { LayerCardProps };
