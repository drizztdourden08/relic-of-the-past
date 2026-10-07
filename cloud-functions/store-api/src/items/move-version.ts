/* @layer store-api @kind logic */
/** One step of the version flow written onto an item, for use inside its transaction. The
 *  latest record is held to the flow table again, the version takes its new shape, and the
 *  live version and the item's status follow from the versions. */
import type { ReviewState } from '../../../../shared/store/review-types';
import type { StoreItem, StoreVersion } from '../../../../shared/store/types';
import type { Actor, VersionAction } from '../../../../shared/store/version-flow';
import { notFound } from '../../../hub-core/http/http-error';
import type { ItemPatch } from '../db/items-repo';
import { statusAfter } from './item-status';
import { requireStep } from './version-guard';
import { liveAfter, replaceVersion, versionOf } from './versions';

/** The version as it stands after the move to `to`. */
type Reshape = (version: StoreVersion, to: ReviewState) => StoreVersion;

type Move = { n: number; action: VersionAction; actors: readonly Actor[]; reshape: Reshape };

const moveVersion = (item: StoreItem, move: Move): ItemPatch => {
  const { n, action, actors, reshape } = move;
  const version = versionOf(item, n);
  if (!version) throw notFound('No such version.');
  const step = requireStep(version, action, actors);
  const versions = replaceVersion(item, reshape(version, step.to));
  const liveVersion = liveAfter(versions);
  return { versions, liveVersion, status: statusAfter({ ...item, versions, liveVersion }) };
};

export { moveVersion };
export type { Move, Reshape };
