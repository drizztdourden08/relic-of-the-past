/* @layer store-site @kind types */
import type { StoreItem } from '@rotp/hub-contracts';
import type { PublishForm } from '../behavior/usePublishForm.type';
import type { PublishMode } from '../Publish.type';

type PublishPicturesProps = {
  mode: PublishMode;
  item: StoreItem | null;
  form: PublishForm;
};

export type { PublishPicturesProps };
