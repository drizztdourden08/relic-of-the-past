/* @layer store-site @kind types */
import type { StoreItem } from '@shared/store/types';
import type { PublishMode } from '../Publish.type';

type PublishFormProps = {
  mode: PublishMode;
  item: StoreItem | null;
};

export type { PublishFormProps };
