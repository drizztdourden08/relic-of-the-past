/* @layer store-site @kind types */
import type { ItemActionsProps } from './ItemActions.type';

type FeatureButtonProps = Pick<ItemActionsProps, 'item' | 'listing'>;

export type { FeatureButtonProps };
