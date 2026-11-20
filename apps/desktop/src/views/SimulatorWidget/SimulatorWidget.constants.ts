/* @layer renderer-widgets @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { LogKindDef } from '@drizztdourden08/tessera/composites';
import type { FilterState } from '@rotp/game-data';
import type { LogKind } from './SimulatorWidget.type';

const SAFETY_CAP = 50_000;
const PAUSED_POLL_MS = 120;
const FEATURES_LATCH_WAIT_MS = 500;

const EMPTY_FILTER: FilterState = {
  searchQuery: '',
  activeFacets: [],
  tagMode: 'any',
  itemFilter: 'all',
  statusFilter: 'all',
};

const ALL_KINDS: LogKind[] = ['seq', 'area', 'screen', 'pos', 'backtrack', 'flood', 'reset', 'check', 'item', 'discover', 'move', 'unlock', 'outcome', 'info', 'debug'];

const kindLabel = (t: I18n['t']): Record<LogKind, string> => ({
  seq: t('views-simulator:log.kind.seq'),
  area: t('views-simulator:log.kind.area'),
  screen: t('views-simulator:log.kind.screen'),
  pos: t('views-simulator:log.kind.pos'),
  backtrack: t('views-simulator:log.kind.backtrack'),
  flood: t('views-simulator:log.kind.flood'),
  reset: t('views-simulator:log.kind.reset'),
  check: t('views-simulator:log.kind.check'),
  item: t('views-simulator:log.kind.item'),
  discover: t('views-simulator:log.kind.discover'),
  move: t('views-simulator:log.kind.move'),
  unlock: t('views-simulator:log.kind.unlock'),
  outcome: t('views-simulator:log.kind.outcome'),
  info: t('views-simulator:log.kind.info'),
  debug: t('views-simulator:log.kind.debug'),
});

const KIND_LOOK: Record<LogKind, Omit<LogKindDef, 'id' | 'label'>> = {
  seq: { tone: 'primary', toneMessage: true, strong: true, uppercase: true },
  area: { tone: 'info', toneMessage: true, strong: true },
  screen: { strong: true },
  pos: { tone: 'muted', toneMessage: 'dim' },
  backtrack: { tone: 'muted', toneMessage: true },
  flood: { tone: 'info', toneMessage: true },
  reset: { tone: 'primary', toneMessage: true },
  check: { tone: 'success', toneMessage: true },
  item: { tone: 'primary', toneMessage: true },
  discover: { tone: 'info' },
  move: { tone: 'muted', toneMessage: 'dim' },
  unlock: { tone: 'primary', toneMessage: true },
  outcome: { tone: 'success', toneMessage: true },
  info: { tone: 'muted' },
  debug: { tone: 'muted', toneMessage: true },
};

const logKinds = (t: I18n['t']): LogKindDef[] => {
  const labels = kindLabel(t);
  return ALL_KINDS.map((kind) => ({ id: kind, label: labels[kind], ...KIND_LOOK[kind] }));
};

export {
  EMPTY_FILTER, FEATURES_LATCH_WAIT_MS, logKinds, PAUSED_POLL_MS, SAFETY_CAP,
};
