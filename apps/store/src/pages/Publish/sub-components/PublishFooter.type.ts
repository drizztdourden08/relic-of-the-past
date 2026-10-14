/* @layer store-site @kind types */
import type { PublishForm } from '../behavior/usePublishForm.type';
import type { PublishMode } from '../Publish.type';

type PublishFooterProps = {
  mode: PublishMode;
  form: PublishForm;
};

export type { PublishFooterProps };
