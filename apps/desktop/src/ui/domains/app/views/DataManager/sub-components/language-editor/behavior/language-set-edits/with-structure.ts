/* @layer renderer-components @kind logic */
import type { LanguageSet, SetStructure } from '@rotp/languages';

const withStructure = (set: LanguageSet, structure: SetStructure): LanguageSet => (
  set.structure === structure ? set : { ...set, structure }
);

export { withStructure };
