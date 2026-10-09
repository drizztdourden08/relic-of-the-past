/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { MsuLayer } from '@shared/types/msu-manifest';
import type { ConfirmRequest } from '../../LayerEditor.type';

interface LayerCardProps {
  layer: MsuLayer;
  index: number;
  total: number;
  available: string[];
  disabled?: boolean;
  live?: ReactNode;
  fileLoopSample: number | null;
  onConfirm: ConfirmRequest;
  onChange: (patch: Partial<Omit<MsuLayer, 'id'>>) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}

export type { LayerCardProps };
