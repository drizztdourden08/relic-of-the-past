/* @layer store-site @kind hook */
import { useCallback, useState } from 'react';
import { errorMessage } from '@rotp/hub-client';
import { navigate } from '@site-kit/router/useLocation';
import { useStoreData } from '../../../data/store-data-context';
import type { PublishTarget } from '../../../upload/publish-target.type';
import { changedText } from './changed-text';
import { textOf } from './text-of';
import { PUBLICATIONS_PATH } from './usePublishSubmit.constants';
import type { Submission } from './usePublishSubmit.type';

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

  const busy = false;
  return { busy, error, submit };
};

export { usePublishSubmit };
