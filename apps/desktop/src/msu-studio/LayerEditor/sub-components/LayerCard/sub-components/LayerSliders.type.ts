/* @layer renderer-components @kind types */
import type { LayerCardProps } from '../LayerCard.type';

type LayerSlidersProps = Pick<LayerCardProps, 'layer' | 'onChange'> & { disabled: boolean };

export type { LayerSlidersProps };
