/* @layer bridge-wasm @kind logic */
/**
 * The name to put in front of a person for one check row.
 *
 * A check record carries the name the dataset transcribes, which for the four
 * fairy slots is Archipelago's own string and spells a side the game does not
 * have. Crossing to the standard name first means a record whose transcribed
 * name differs from its location (the capacity pond's two, which the dataset
 * writes as the first tier of each family) is looked up as the slot it is.
 * Everything else falls straight back to its own name.
 */
import { locationDisplayName } from '@shared/randomizer/ap-world/display-names';
import type { CheckRecord } from '@shared/game/data';
import { standardNameOfCheck } from './check-names';

const checkDisplayName = (check: CheckRecord): string => {
  const standard = standardNameOfCheck(check);
  const display = locationDisplayName(standard);
  return display === standard ? check.randomizerName : display;
};

export { checkDisplayName };
