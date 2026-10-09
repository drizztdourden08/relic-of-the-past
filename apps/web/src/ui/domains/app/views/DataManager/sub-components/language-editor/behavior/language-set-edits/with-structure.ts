/* @layer renderer-components @kind logic */
import type { LanguageSet, SetStructure } from '@shared/game/language';

const withStructure = (set: LanguageSet, structure: SetStructure): LanguageSet => (
  set.structure === structure ? set : { ...set, structure }
);

export { withStructure };
