/* @layer store-api @kind logic */
/** The version flow table as HTTP answers. A move the version's state does not allow is a
 *  conflict, a move the caller may not take is forbidden, and a move that needs a file the
 *  store removed is a conflict that says so. */
import type { StoreVersion } from '../../../../shared/store/types';
import { refusalOf, stepOf } from '../../../../shared/store/version-flow';
import type { Actor, FlowStep, VersionAction } from '../../../../shared/store/version-flow';
import { conflict, forbidden } from '../../../hub-core/http/http-error';

const DONE: Record<VersionAction, string> = {
  submit: 'sent for review',
  withdraw: 'withdrawn',
  approve: 'approved',
  reject: 'rejected',
  delete: 'deleted',
  abort: 'cancelled',
};

const WHO: Record<Actor, string> = { author: 'the author', reviewer: 'a reviewer' };

const requireStep = (version: StoreVersion, action: VersionAction, actors: readonly Actor[]): FlowStep => {
  const refusal = refusalOf(version, action, actors);
  const step = stepOf(version, action);
  if (refusal === 'state' || !step) throw conflict(`This version is ${version.review.state}, so it cannot be ${DONE[action]}.`);
  if (refusal === 'actor') throw forbidden(`Only ${step.by.map((actor) => WHO[actor]).join(' or ')} can do that.`);
  if (refusal === 'file') throw conflict(`The file of this version was removed, so it cannot be ${DONE[action]}.`);
  return step;
};

export { requireStep };
