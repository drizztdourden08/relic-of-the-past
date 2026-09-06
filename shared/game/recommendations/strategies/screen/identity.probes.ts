/* @layer shared-game @kind data */
/**
 * Field probes for the fields the game can settle beyond `ScreenGameId`'s own
 * four native identifiers.
 */
import { known, unread } from '../../compare/probe-helpers';
import type { FieldProbe } from '../../compare/probe.types';
import { isCurrentScreen } from './game-id.probes';

/**
 * The game reports a screen's kind only implicitly, via `isIndoors`. Outdoors
 * that one bit IS `'overworld'`, provably. Indoors it settles nothing: the
 * record could legitimately be `'dungeon'`, `'interior'` or `'cave'`, and no
 * native byte distinguishes those, so guessing indoors would manufacture a
 * finding the game never actually proved. Only the outdoor case is provable,
 * and (as with the game-id probes) only for the CURRENTLY loaded screen.
 * `subjects` can include other screens named by a recorded palace mismatch,
 * and `isIndoors` is a global flag that says nothing about THOSE screens.
 */
const KIND_PROBE: FieldProbe<'screen'> = {
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

// `position.floor` needs a dungeon-map-position observation `ScreenObservations`
// does not carry yet. Phase 4 adds it. No probe here until it exists;
// inventing one from nothing would be exactly the guessing this module
// refuses to do everywhere else.

const IDENTITY_PROBES: readonly FieldProbe<'screen'>[] = [KIND_PROBE];

export { IDENTITY_PROBES };
