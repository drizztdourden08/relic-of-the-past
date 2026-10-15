/* @layer shared-game-data @kind logic */
import { MSU_TRACK_NAMES_BY_NUMBER } from './msu-track-names.constants';

const msuTrackName = (trackNum: number): string | null => MSU_TRACK_NAMES_BY_NUMBER.get(trackNum) ?? null;

export { msuTrackName };
