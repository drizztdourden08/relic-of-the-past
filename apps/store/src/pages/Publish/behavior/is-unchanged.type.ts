/* @layer store-site @kind types */
import type { Picture } from '../../../upload/resize-image';
import type { PublishMode } from '../Publish.type';

type UnchangedParams = {
  mode: PublishMode;
  patch: object;
  card: Picture | null;
  banner: Picture | null;
};

export type { UnchangedParams };
