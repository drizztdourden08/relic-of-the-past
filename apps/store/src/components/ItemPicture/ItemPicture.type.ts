/* @layer store-site @kind types */
import type { MediaRef, StoreKind } from '@shared/store/types';

type ItemPictureProps = {
  picture: MediaRef | null;
  kind: StoreKind;
  role?: 'card' | 'banner';
  color?: string;
  className?: string;
};

export type { ItemPictureProps };
