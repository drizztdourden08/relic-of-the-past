/* @layer sanctuary-site @kind constants */
/** The static scopes of the Reports page: by kind, then the user's own and the expiring ones. */
type Scope = {
  id: string;
  label: string;
};

const REPORT_SCOPE_IDS = {
  all: 'all',
  player: 'player',
  controller: 'controller',
  mine: 'mine',
  expiring: 'expiring',
} as const;

type ReportScopeId = (typeof REPORT_SCOPE_IDS)[keyof typeof REPORT_SCOPE_IDS];

const REPORT_SCOPES: Scope[] = [
  { id: REPORT_SCOPE_IDS.all, label: 'All' },
  { id: REPORT_SCOPE_IDS.player, label: 'Player' },
  { id: REPORT_SCOPE_IDS.controller, label: 'Controller' },
  { id: REPORT_SCOPE_IDS.mine, label: 'Filed by me' },
  { id: REPORT_SCOPE_IDS.expiring, label: 'Expiring soon' },
];

/** A report whose deadline is within this many days counts as expiring soon. */
const EXPIRING_SOON_DAYS = 14;

export { REPORT_SCOPES, REPORT_SCOPE_IDS, EXPIRING_SOON_DAYS };
export type { ReportScopeId, Scope };
