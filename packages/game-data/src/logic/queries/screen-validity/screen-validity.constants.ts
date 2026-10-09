/* @layer shared-game @kind constants */
import type { ScreenKind } from '../../../data';
import { MAX_PROGRESS_TIER } from '../progress-tier/progress-tier.constants';

const NEEDS_AREA = 'a real area';
const NEEDS_LOCATION = 'a real location';
const NEEDS_COHERENT_LOCATION = 'a location that belongs to the chosen area';
const NEEDS_FILE = 'a source file it can live in';
const NEEDS_REAL_TIER = `a variant progress tier within 0-${MAX_PROGRESS_TIER}`;
const NEEDS_AGREEING_TIER = 'a variant progress tier that matches its own progress condition';
const NEEDS_PALACE = 'a palace index';
const NEEDS_INDEX: Readonly<Record<ScreenKind, string>> = {
  overworld: 'an overworld index',
  dungeon: 'a room index',
  interior: 'a room index',
};

export {
  NEEDS_AGREEING_TIER, NEEDS_AREA, NEEDS_COHERENT_LOCATION, NEEDS_FILE, NEEDS_INDEX, NEEDS_LOCATION, NEEDS_PALACE,
  NEEDS_REAL_TIER,
};
