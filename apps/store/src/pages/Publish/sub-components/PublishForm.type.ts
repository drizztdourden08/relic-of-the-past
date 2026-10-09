/* @layer store-site @kind types */
import type { StoreItem } from '@rotp/hub-contracts';
import type { PublishMode } from '../Publish.type';

type PublishFormProps = {
  mode: PublishMode;
  item: StoreItem | null;
};

export type { PublishFormProps };
