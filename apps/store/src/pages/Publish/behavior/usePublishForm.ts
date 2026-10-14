/* @layer store-site @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { StoreItem } from '@rotp/hub-contracts';
import { STORE_LIMITS } from '@rotp/hub-contracts';
import { FIELD_MESSAGES } from '../Publish.constants';
import type { PublishMode } from '../Publish.type';
import { formErrors } from './form-errors';
import { isUnchanged } from './is-unchanged';
import { needsALook } from './needs-a-look';
import { noteOf } from './note-of';
import { useFieldErrors } from './useFieldErrors';
import { useListingFields } from './useListingFields';
import { usePack } from './usePack';
import { usePicture } from './usePicture';
import { usePublishSubmit } from './usePublishSubmit';

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

  const note = noteOf(mode, item);
  const unchanged = isUnchanged({ mode, patch: listing.patch, card: card.picture, banner: banner.picture });
  const alertLine = useMemo(() => {
    if (fields.attempts === 0) return null;
    if (fields.count > 0) return needsALook(fields.count);
    return unchanged ? FIELD_MESSAGES.nothingChanged : null;
  }, [fields.attempts, fields.count, unchanged]);

  const submit = useCallback(() => {
    fields.attempt();
    if (note || fields.count > 0 || unchanged) return;
    sending.submit({
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

export { usePublishForm };
