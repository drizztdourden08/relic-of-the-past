/* @layer test @kind helper */
import type { ScreenObservations } from '@shared/game/recommendations';

const observations = (overrides: Partial<ScreenObservations> = {}): ScreenObservations => ({
  match: null,
  liveGameId: null,
  isIndoors: true,
  isDarkWorld: false,
  realTransitions: [],
  realAvailable: true,
  unmatchedCrossings: [],
  floodConnections: [],
  existingConnections: [],
  palaceMismatches: [],
  ...overrides,
});

export { observations };
