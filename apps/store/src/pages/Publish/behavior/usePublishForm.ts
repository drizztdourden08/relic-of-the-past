/* @layer store-site @kind hook */
/**
 * Everything the Publish form holds for one mode: the pack and what changed in it, the
 * listing text, the two pictures and the rights box, with an error for each field that is
 * wrong. Submit stays pressable: a press with fields still wrong shows every error and sends
 * nothing. A version still uploading, ready or in review blocks a new one, and a listing
 * edit needs a change.
 * Store-api numbers each version itself.
 */
import { useCallback, useMemo, useState } from 'react';
import type { StoreItem } from '@shared/store/types';
import { STORE_LIMITS } from '@shared/store/limits';
import { isInFlight } from '@shared/store/version-flow';
import { FIELD_MESSAGES, needsALook } from '../Publish.constants';
import type { PublishMode } from '../Publish.constants';
import { formErrors } from './form-errors';
import { useFieldErrors } from './useFieldErrors';
import { useListingFields } from './useListingFields';
import { usePack } from './usePack';
import { usePicture } from './usePicture';
import { usePublishSubmit } from './usePublishSubmit';

const inFlight = (item: StoreItem) => item.versions.some(isInFlight);

const usePublishForm = (mode: PublishMode, item: StoreItem | null) => {
  const pack = usePack(item?.kind ?? null);
  const listing = useListingFields(item);
  const card = usePicture(STORE_LIMITS.card);
  const banner = usePicture(STORE_LIMITS.banner);
  const [changelog, setChangelog] = useState('');
  const [rights, setRights] = useState(false);
  const sending = usePublishSubmit();

  const errors = useMemo(
    () => formErrors({ mode, pack, listing: listing.errors, card, rights }),
    [mode, pack, listing.errors, card, rights],
  );
  const fields = useFieldErrors(errors);

  /** A reason no field can fix, shown over the form from the start. */
  const note = mode === 'version' && item && inFlight(item) ? FIELD_MESSAGES.inFlight : null;
  const unchanged = mode === 'listing' && Object.keys(listing.patch).length === 0 && !card.picture && !banner.picture;
  const alertLine = useMemo(() => {
    if (fields.attempts === 0) return null;
    if (fields.count > 0) return needsALook(fields.count);
    return unchanged ? FIELD_MESSAGES.nothingChanged : null;
  }, [fields.attempts, fields.count, unchanged]);

  const submit = useCallback(() => {
    fields.attempt();
    if (note || fields.count > 0 || unchanged) return;
    void sending.submit({
      item,
      kind: item?.kind ?? pack.kind,
      text: listing.text,
      card: card.picture,
      banner: banner.picture,
      pack,
      changelog: mode === 'version' ? changelog : '',
    });
  }, [fields, note, unchanged, sending, item, pack, listing.text, card.picture, banner.picture, mode, changelog]);

  return {
    takesPack: mode !== 'listing',
    takesListing: mode !== 'version',
    takesChanges: mode === 'version',
    pack,
    listing,
    card,
    banner,
    changes: { changelog, setChangelog },
    rights: { checked: rights, set: setRights },
    fields,
    note,
    alertLine,
    busy: sending.busy || card.busy || banner.busy,
    error: sending.error,
    submit,
  };
};

type PublishForm = ReturnType<typeof usePublishForm>;

export { usePublishForm };
export type { PublishForm };
