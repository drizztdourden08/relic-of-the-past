/* @layer shared-store @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { License } from './licenses.type';

const LICENSES: readonly License[] = [
  { id: 'CC-BY-4.0', label: 'CC-BY-4.0', description: msg('hub-contracts:license.ccBy'), allowsCopies: true },
  { id: 'CC-BY-SA-4.0', label: 'CC-BY-SA-4.0', description: msg('hub-contracts:license.ccBySa'), allowsCopies: true },
  { id: 'CC-BY-NC-4.0', label: 'CC-BY-NC-4.0', description: msg('hub-contracts:license.ccByNc'), allowsCopies: true },
  { id: 'CC0-1.0', label: 'CC0-1.0', description: msg('hub-contracts:license.cc0'), allowsCopies: true },
  { id: 'All rights reserved', label: 'All rights reserved', description: msg('hub-contracts:license.allRightsReserved'), allowsCopies: false },
];

export { LICENSES };
