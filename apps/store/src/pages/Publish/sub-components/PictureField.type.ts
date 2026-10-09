/* @layer store-site @kind types */
import type { MediaRef, StoreKind } from '@rotp/hub-contracts';
import type { PictureState } from '../behavior/usePicture.type';

type PictureFieldProps = {
  label: string;
  size: string;
  role: 'card' | 'banner';
  state: PictureState;
  current: MediaRef | null;
  kind: StoreKind;
  color: string;
  error?: string;
  onPick?: () => void;
};

export type { PictureFieldProps };
