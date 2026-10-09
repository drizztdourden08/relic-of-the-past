/* @layer store-site @kind logic */
import { FIELD_MESSAGES } from '../Publish.constants';
import type { FieldErrors, PublishMode } from '../Publish.type';
import { compactErrors } from './compact-errors';
import type { FormErrorsInput } from './form-errors.type';
import type { PackState } from './usePack.type';
import type { PictureState } from './usePicture.type';

const packError = ({ file, problem }: PackState) => (file ? problem : FIELD_MESSAGES.packMissing);

const cardError = (mode: PublishMode, { picture, busy, error }: PictureState) =>
  error ?? (mode === 'new' && !picture && !busy ? FIELD_MESSAGES.cardMissing : null);

const formErrors = ({ mode, pack, listing, card, rights }: FormErrorsInput): FieldErrors => compactErrors({
  pack: mode === 'listing' ? null : packError(pack),
  ...(mode === 'version' ? {} : listing),
  card: mode === 'version' ? null : cardError(mode, card),
  rights: rights ? null : FIELD_MESSAGES.rights,
});

export { formErrors };
