/* @layer shared-game @kind logic */
import type { ScreenRecord } from '../../../data/types';
import type { ScreenObservations } from '../../detection-types';

const isCurrentScreen = (observations: ScreenObservations, record: ScreenRecord): boolean =>
  observations.match?.screen.id === record.id;

export { isCurrentScreen };
