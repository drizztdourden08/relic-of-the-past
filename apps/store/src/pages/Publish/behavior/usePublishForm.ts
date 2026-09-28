/* @layer store-site @kind hook */
/**
 * Everything the Publish form holds for one mode: the pack and what changed in it, the
 * listing text, the two pictures and the rights box, with the first thing still wrong. The
 * submit button stays off until nothing is. A new item needs all of it; a new version needs
 * the pack; a listing edit needs a change. Store-api numbers each version itself.
 */
import { useCallback, useMemo, useState } from 'react';
import type { StoreItem } from '@shared/store/types';
import { STORE_LIMITS } from '@shared/store/limits';
import type { PublishMode } from '../Publish.constants';
import { useListingFields } from './useListingFields';
import { usePack } from './usePack';
import { usePicture } from './usePicture';
import { usePublishSubmit } from './usePublishSubmit';

const inFlight = (item: StoreItem) => item.versions.some((v) => v.review.state === 'uploading' || v.review.state === 'waiting');

const usePublishForm = (mode: PublishMode, item: StoreItem | null) => {
  const pack = usePack(item?.kind ?? null);
  const listing = useListingFields(item);
  const card = usePicture(STORE_LIMITS.card);
  const banner = usePicture(STORE_LIMITS.banner);
  const [changelog, setChangelog] = useState('');
  const [rights, setRights] = useState(false);
  const sending = usePublishSubmit();

  const takesPack = mode !== 'listing';
  const takesListing = mode !== 'version';

  const problem = useMemo((): string | null => {
    if (mode === 'version' && item && inFlight(item)) return 'A version is already waiting for review. Withdraw it first, or wait for the decision.';
    if (takesPack && !pack.file) return 'Add the pack file.';
    if (takesPack && pack.problem) return pack.problem;
    if (takesListing && listing.problem) return listing.problem;
    if (mode === 'new' && !card.picture) return 'Add a card picture.';
    if (mode === 'listing' && Object.keys(listing.patch).length === 0 && !card.picture && !banner.picture) return 'Nothing has changed yet.';
    if (!rights) return 'Tick the box to confirm you may share it.';
    return null;
  }, [mode, item, takesPack, takesListing, pack, listing, card.picture, banner.picture, rights]);

  const submit = useCallback(() => {
    void sending.submit({
      item,
      kind: item?.kind ?? pack.kind,
      text: listing.text,
      card: card.picture,
      banner: banner.picture,
      pack,
      changelog,
    });
  }, [sending, item, pack, listing.text, card.picture, banner.picture, changelog]);

  return {
    takesPack,
    takesListing,
    pack,
    listing,
    card,
    banner,
    changes: { changelog, setChangelog },
    rights: { checked: rights, set: setRights },
    problem,
    busy: sending.busy || card.busy || banner.busy,
    error: sending.error,
    submit,
  };
};

type PublishForm = ReturnType<typeof usePublishForm>;

export { usePublishForm };
export type { PublishForm };
