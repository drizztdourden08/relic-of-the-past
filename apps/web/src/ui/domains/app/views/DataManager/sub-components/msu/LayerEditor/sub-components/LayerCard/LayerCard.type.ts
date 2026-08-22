/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { MsuLayer } from '@shared/types/msu-manifest';

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
  onChange: (patch: Partial<Omit<MsuLayer, 'id'>>) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}

export type { LayerCardProps };
