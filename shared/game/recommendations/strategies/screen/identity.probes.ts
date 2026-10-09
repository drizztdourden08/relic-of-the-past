/* @layer shared-game @kind logic */
import { known, unread } from '../../compare/probe-reading';
import type { FieldProbe } from '../../compare/probe.type';
import { isCurrentScreen } from './is-current-screen';

const kindProbe: FieldProbe<'screen'> = {
  path: 'kind',
  label: 'Kind',
  source: 'native:room-identity',
  confidence: 'certain',
  applies: () => true,
  read: (observations, record) => {
    if (observations.isIndoors || !isCurrentScreen(observations, record)) return unread();
    return known('overworld');
  },
};

const identityProbes: readonly FieldProbe<'screen'>[] = [kindProbe];

export { identityProbes };
