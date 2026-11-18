/* @layer renderer-app @kind logic */
import { optionCatalog, optionText } from '@rotp/randomizer';
import type { OptionCatalog } from '@drizztdourden08/brock-randomizer';

const rotpCatalog: OptionCatalog = optionCatalog.map((option) => ({
  key: option.key,
  get label() {
    return optionText(option.displayName);
  },
  default: option.baseline,
  frozen: option.locked,
  hint: option.description,
}));

export { rotpCatalog };
