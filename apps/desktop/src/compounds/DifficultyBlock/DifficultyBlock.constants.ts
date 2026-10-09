/* @layer renderer-components @kind constants */
import { COPY_MULTIPLIERS } from '@rotp/randomizer';

const DIFFICULTY_TITLE = 'Difficulty';

const DIFFICULTY_CAPTION = 'Extra copies take the place of small pickups, so the seed stays the same size.';

const DIFFICULTY_COPIES_HEADING = 'Copies of each tiered item';

const DIFFICULTY_HEARTS_HEADING = 'Hearts';

const NO_RUNGS_NOTE = 'No rungs left in this family, so there is nothing to multiply.';

const FIRST_STEP = Math.min(...COPY_MULTIPLIERS);
const LAST_STEP = Math.max(...COPY_MULTIPLIERS);

export {
  DIFFICULTY_CAPTION,
  DIFFICULTY_COPIES_HEADING,
  DIFFICULTY_HEARTS_HEADING,
  DIFFICULTY_TITLE,
  FIRST_STEP,
  LAST_STEP,
  NO_RUNGS_NOTE,
};
