/* @layer renderer-app @kind logic */
import { optionCatalog } from '@rotp/randomizer';
import type { OptionCatalog } from '@drizztdourden08/brock-randomizer';

const rotpCatalog: OptionCatalog = optionCatalog.map((option) => ({
  key: option.key,
  label: option.displayName,
  default: option.baseline,
  frozen: option.locked,
  hint: option.description,
}));

export { rotpCatalog };
