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
  /**
   * A live readout of this layer during a preview, supplied ready-made. The card renders it and
   * asks nothing about it, which is what keeps the card presentational while the readout redraws
   * on its own every frame.
   */
  live?: ReactNode;
  /** What this layer's own file declares as its loop point, when the manifest sets none. */
  fileLoopSample: number | null;
  /**
   * Handed up to the app's confirm dialog before an order change discards files — see
   * `useModeChange`. Without it that order change simply leaves the files alone.
   */
  onConfirm: ConfirmRequest;
  onChange: (patch: Partial<Omit<MsuLayer, 'id'>>) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}

export type { LayerCardProps };
