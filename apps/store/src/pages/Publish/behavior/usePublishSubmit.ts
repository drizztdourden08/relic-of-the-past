/* @layer store-site @kind hook */
/**
 * Sending the form: the whole publish (the draft for a new item, its pictures, the listing
 * changes, then the pack) goes to the store's upload queue as one job. Its dialog opens and
 * the page moves to My publications at once, so the form is gone while the job runs on in
 * the corner. A listing edit is the same job without the pack.
 */
import { useCallback, useState } from 'react';
import type { StoreItem, StoreKind } from '@shared/store/types';
import { errorMessage } from '@site-kit/api/api-error';
import { navigate } from '@site-kit/router/useLocation';
import { useStoreData } from '../../../data/store-data-context';
import type { Picture } from '../../../lib/resize-image';
import type { PublishTarget } from '../../../upload/publish-target.type';
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
  changelog: string;
};

const PUBLICATIONS_PATH = '/publications';

const targetOf = (submission: Submission): PublishTarget => {
  const { item, kind, text, card, banner, pack, changelog } = submission;
  const packTarget = pack.file && pack.container ? { container: pack.container, changelog: changelog.trim() } : null;
  if (item) {
    const patch = changedText(textOf(item), text);
    return { itemId: item.id, itemName: item.name, isNew: false, draft: null, patch, card, banner, pack: packTarget };
  }
  if (!kind) throw new Error('Pick the pack first, so the Hookshop knows what kind of item it is.');
  const draft = { kind, ...text, tags: [...text.tags] };
  return { itemId: null, itemName: text.name.trim(), isNew: true, draft, patch: {}, card, banner, pack: packTarget };
};

const usePublishSubmit = () => {
  const { uploads } = useStoreData();
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (submission: Submission) => {
    setError(null);
    try {
      const target = targetOf(submission);
      const id = uploads.add(target, target.pack ? submission.pack.file : null);
      uploads.open(id);
      navigate(PUBLICATIONS_PATH);
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }, [uploads]);

  /** Handing a job to the queue is instant; the form never waits on the upload. */
  const busy = false;
  return { busy, error, submit };
};

export { usePublishSubmit };
export type { Submission };
