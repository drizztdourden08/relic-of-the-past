/* @layer store-api @kind logic */
/** Who may rate an item: a player who installed it through the store, never its author,
 *  and only while they can see it. Answers the refusal, or null when the rating may stand. */
import type { StoreItem } from '../../../../shared/store/types';
import { forbidden, notFound } from '../../../hub-core/http/http-error';
import type { HttpError } from '../../../hub-core/http/http-error';
import { canView } from '../items/project-item';
import type { Viewer } from '../items/project-item';

const ratingRefusal = (item: StoreItem, viewer: Viewer, installed: boolean): HttpError | null => {
  if (!canView(item, viewer)) return notFound('No such item.');
  if (item.author.userId === viewer.caller.userId) return forbidden('You cannot rate your own item.');
  if (!installed) return forbidden('Install it before rating it.');
  return null;
};

export { ratingRefusal };
