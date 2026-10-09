/* @layer shared-game @kind logic */
import type { ScreenRecord } from '@rotp/game-data';
import type { ScreenObservations } from '../../detection-types';

const isCurrentScreen = (observations: ScreenObservations, record: ScreenRecord): boolean =>
  observations.match?.screen.id === record.id;

export { isCurrentScreen };
