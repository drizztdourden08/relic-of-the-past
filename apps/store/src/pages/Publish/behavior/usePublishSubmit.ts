/* @layer store-site @kind hook */
/**
 * Sending the form, in the order store-api needs: the draft first (a new item), then its
 * pictures and the listing that names them (the API refuses a version before the item has a
 * card), then the pack, which joins the upload list and runs on while the player moves on
 * to My publications. A draft created by a failed attempt is reused on the next one.
 */
import { useCallback, useRef, useState } from 'react';
import type { StoreItem, StoreKind } from '@shared/store/types';
import type { ListingPatchBody } from '@shared/store/schemas';
import { errorMessage } from '@site-kit/api/api-error';
import { navigate } from '@site-kit/router/useLocation';
import { createItem, submitListing } from '../../../api/publish-endpoints';
import { useStoreData } from '../../../data/store-data-context';
import { uploadPicture } from '../../../upload/upload-picture';
import type { Picture } from '../../../lib/resize-image';
import { changedText, textOf } from './useListingFields';
import type { ListingText } from './useListingFields';
import type { PackState } from './usePack';

type Submission = {
  item: StoreItem | null;
  kind: StoreKind | null;
  text: ListingText;
  card: Picture | null;
  banner: Picture | null;
  pack: PackState;
  semver: string;
  changelog: string;
};

const PUBLICATIONS_PATH = '/publications';

const usePublishSubmit = () => {
  const { uploads, onItem } = useStoreData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const created = useRef<StoreItem | null>(null);

  /** The new draft with the whole listing, which then needs no text patch. */
  const createDraft = useCallback(async ({ kind, text }: Submission): Promise<StoreItem> => {
    if (!kind) throw new Error('Pick the pack first, so the Hookshop knows what kind of item it is.');
    const { item: draft } = await createItem({ kind, ...text, tags: [...text.tags] });
    created.current = draft;
    onItem(draft);
    return draft;
  }, [onItem]);

  const submit = useCallback(async (submission: Submission) => {
    const { item, text, card, banner, pack, semver, changelog } = submission;
    setBusy(true);
    setError(null);
    try {
      const existing = item ?? created.current;
      let target = existing ?? await createDraft(submission);
      const patch: ListingPatchBody = existing ? changedText(textOf(existing), text) : {};
      if (card) patch.card = await uploadPicture(target.id, 'card', card);
      if (banner) patch.banner = await uploadPicture(target.id, 'banner', banner);
      if (Object.keys(patch).length > 0) {
        target = (await submitListing(target.id, patch)).item;
        onItem(target);
      }
      if (pack.file && pack.container) {
        uploads.start([pack.file], { itemId: target.id, itemName: target.name, semver: semver.trim(), changelog: changelog.trim(), container: pack.container });
      }
      navigate(PUBLICATIONS_PATH);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, [createDraft, onItem, uploads]);

  return { busy, error, submit };
};

export { usePublishSubmit };
export type { Submission };
