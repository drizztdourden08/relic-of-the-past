/* @layer shared-sanctuary @kind constants */
import type { RightsModel } from '../../hub/rights-model.type';
import { describeSanctuaryRights } from './describe-sanctuary-rights';
import { FILE_PERMISSIONS, PERMISSION_LABELS, REPORTS_PERMISSION } from './sanctuary-permissions.constants';
import type { SanctuaryPermission } from './sanctuary-rights.type';

const SANCTUARY_RIGHTS: RightsModel<SanctuaryPermission> = {
  site: 'sanctuary',
  all: [...FILE_PERMISSIONS, REPORTS_PERMISSION],
  labels: PERMISSION_LABELS,
  describe: describeSanctuaryRights,
};

export { SANCTUARY_RIGHTS };
