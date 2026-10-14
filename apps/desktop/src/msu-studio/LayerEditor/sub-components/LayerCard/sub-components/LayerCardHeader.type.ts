/* @layer renderer-components @kind types */
import type { LayerCardProps } from '../LayerCard.type';

type LayerCardHeaderProps = Pick<LayerCardProps, 'layer' | 'index' | 'total' | 'onChange' | 'onMove' | 'onRemove'> & {
  disabled: boolean;
};

export type { LayerCardHeaderProps };
