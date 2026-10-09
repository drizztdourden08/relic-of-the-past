/* @layer store-api @kind logic */
import type { StoreVersion, Actor, FlowStep, VersionAction } from '@rotp/hub-contracts';
import { refusalOf, stepOf } from '@rotp/hub-contracts';
import { conflict, forbidden } from '@rotp/hub-server';
import { DONE, WHO } from './version-guard.constants';

const requireStep = (version: StoreVersion, action: VersionAction, actors: readonly Actor[]): FlowStep => {
  const refusal = refusalOf(version, action, actors);
  const step = stepOf(version, action);
  if (refusal === 'state' || !step) throw conflict(`This version is ${version.review.state}, so it cannot be ${DONE[action]}.`);
  if (refusal === 'actor') throw forbidden(`Only ${step.by.map((actor) => WHO[actor]).join(' or ')} can do that.`);
  if (refusal === 'file') throw conflict(`The file of this version was removed, so it cannot be ${DONE[action]}.`);
  return step;
};

export { requireStep };
