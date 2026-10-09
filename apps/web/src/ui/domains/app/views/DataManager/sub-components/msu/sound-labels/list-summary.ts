/* @layer renderer-components @kind logic */
import { NAMES_SHOWN } from './sound-labels.constants';

const listSummary = (names: string[]): string => {
  const shown = names.slice(0, NAMES_SHOWN).join(' · ');
  const rest = names.length - NAMES_SHOWN;
  return rest > 0 ? `${shown} +${rest} more` : shown;
};

export { listSummary };
