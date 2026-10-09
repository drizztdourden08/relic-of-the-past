/* @layer sanctuary-site @kind constants */
import type { Scope } from './Reports.type';

const REPORT_SCOPE_IDS = {
  all: 'all',
  player: 'player',
  controller: 'controller',
  mine: 'mine',
  expiring: 'expiring',
} as const;

const REPORT_SCOPES: Scope[] = [
  { id: REPORT_SCOPE_IDS.all, label: 'All' },
  { id: REPORT_SCOPE_IDS.player, label: 'Player' },
  { id: REPORT_SCOPE_IDS.controller, label: 'Controller' },
  { id: REPORT_SCOPE_IDS.mine, label: 'Filed by me' },
  { id: REPORT_SCOPE_IDS.expiring, label: 'Expiring soon' },
];

const EXPIRING_SOON_DAYS = 14;

const COUNT_LABEL = ['report', 'reports'] as const;
const SEARCH_PLACEHOLDER = 'Search subject, reporter, issue...';

export { REPORT_SCOPES, REPORT_SCOPE_IDS, EXPIRING_SOON_DAYS, COUNT_LABEL, SEARCH_PLACEHOLDER };
