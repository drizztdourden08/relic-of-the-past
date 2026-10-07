/* @layer store-site @kind logic */
/**
 * Every field error of the Publish form for one mode. A new item needs the pack, the listing,
 * a card picture and the rights box; a new version needs the pack and the box; a listing
 * edit needs the listing and the box.
 */
import { FIELD_MESSAGES } from '../Publish.constants';
import type { PublishMode } from '../Publish.constants';
import type { FieldErrors } from '../Publish.type';
import { compactErrors } from './compact-errors';
import type { PackState } from './usePack';
import type { PictureState } from './usePicture';

type FormErrorsInput = {
  mode: PublishMode;
  pack: PackState;
  listing: FieldErrors;
  card: PictureState;
  rights: boolean;
};

const packError = ({ file, problem }: PackState) => (file ? problem : FIELD_MESSAGES.packMissing);

/** A picture still being made is not missing. */
const cardError = (mode: PublishMode, { picture, busy, error }: PictureState) =>
  error ?? (mode === 'new' && !picture && !busy ? FIELD_MESSAGES.cardMissing : null);

const formErrors = ({ mode, pack, listing, card, rights }: FormErrorsInput): FieldErrors => compactErrors({
  pack: mode === 'listing' ? null : packError(pack),
  ...(mode === 'version' ? {} : listing),
  card: mode === 'version' ? null : cardError(mode, card),
  rights: rights ? null : FIELD_MESSAGES.rights,
});

export { formErrors };
