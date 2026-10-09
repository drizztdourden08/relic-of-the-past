/* @layer store-site @kind types */
import type { FieldErrors, PublishMode } from '../Publish.type';
import type { PackState } from './usePack.type';
import type { PictureState } from './usePicture.type';

type FormErrorsInput = {
  mode: PublishMode;
  pack: PackState;
  listing: FieldErrors;
  card: PictureState;
  rights: boolean;
};

export type { FormErrorsInput };
