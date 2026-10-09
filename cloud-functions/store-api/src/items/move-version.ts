/* @layer store-api @kind logic */
import type { StoreItem } from '../../../../shared/store/types';
import { notFound } from '../../../hub-core/http/http-error';
import type { ItemPatch } from '../db/items-repo.type';
import { statusAfter } from './item-status';
import type { Move } from './move-version.type';
import { requireStep } from './version-guard';
import { liveAfter, replaceVersion, versionOf } from './versions';

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
