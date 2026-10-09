/* @layer hub-core @kind logic */
import type { GroupRights, RightsModel } from '../../../shared/hub';
import { badRequest } from '../http/http-error';

const assertKnownRights = (rights: GroupRights | undefined, model: RightsModel): void => {
  const unknown = (rights?.[model.site] ?? []).find((permission) => !model.all.includes(permission));
  if (unknown) throw badRequest(`Invalid rights.${model.site}: no permission "${unknown}".`);
};

export { assertKnownRights };
