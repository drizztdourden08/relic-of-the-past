/* @layer store-site @kind hook */
/**
 * Everything the Publish form holds for one mode: the pack, the version and its changes, the
 * listing text, the two pictures and the rights box, with the first thing still wrong. The
 * submit button stays off until nothing is. A new item needs all of it; a new version needs
 * the pack and its version; a listing edit needs a change.
 */
import { useCallback, useMemo, useState } from 'react';
import type { StoreItem } from '@shared/store/types';
import { STORE_LIMITS } from '@shared/store/limits';
import { semverProblem } from '../../../lib/semver';
import type { PublishMode } from '../Publish.constants';
import { useListingFields } from './useListingFields';
import { usePack } from './usePack';
import { usePicture } from './usePicture';
import { usePublishSubmit } from './usePublishSubmit';

const inFlight = (item: StoreItem) => item.versions.some((v) => v.review.state === 'uploading' || v.review.state === 'waiting');

/** The numbers a new version must pass: every one not rejected or withdrawn, as store-api counts them. */
const countedSemvers = (item: StoreItem | null): string[] =>
  (item?.versions ?? []).filter((v) => v.review.state !== 'rejected' && v.review.state !== 'withdrawn').map((v) => v.semver);

const usePublishForm = (mode: PublishMode, item: StoreItem | null) => {
  const pack = usePack(item?.kind ?? null);
  const listing = useListingFields(item);
  const card = usePicture(STORE_LIMITS.card);
  const banner = usePicture(STORE_LIMITS.banner);
  const [semver, setSemver] = useState('');
  const [changelog, setChangelog] = useState('');
  const [rights, setRights] = useState(false);
  const sending = usePublishSubmit();

  const takesPack = mode !== 'listing';
  const takesListing = mode !== 'version';

  const problem = useMemo((): string | null => {
    if (mode === 'version' && item && inFlight(item)) return 'A version is already waiting for review. Withdraw it first, or wait for the decision.';
    if (takesPack && !pack.file) return 'Add the pack file.';
    if (takesPack && pack.problem) return pack.problem;
    if (takesPack) {
      const bad = semverProblem(semver, countedSemvers(item));
      if (bad) return `Version: ${bad}`;
    }
    if (takesListing && listing.problem) return listing.problem;
    if (mode === 'new' && !card.picture) return 'Add a card picture.';
    if (mode === 'listing' && Object.keys(listing.patch).length === 0 && !card.picture && !banner.picture) return 'Nothing has changed yet.';
    if (!rights) return 'Tick the box to confirm you may share it.';
    return null;
  }, [mode, item, takesPack, takesListing, pack, semver, listing, card.picture, banner.picture, rights]);

  const submit = useCallback(() => {
    void sending.submit({
      item,
      kind: item?.kind ?? pack.kind,
      text: listing.text,
      card: card.picture,
      banner: banner.picture,
      pack,
      semver,
      changelog,
    });
  }, [sending, item, pack, listing.text, card.picture, banner.picture, semver, changelog]);

  const counted = countedSemvers(item);

  return {
    lastSemver: counted.length ? counted[counted.length - 1] : null,
    takesPack,
    takesListing,
    pack,
    listing,
    card,
    banner,
    version: { semver, setSemver, changelog, setChangelog },
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
