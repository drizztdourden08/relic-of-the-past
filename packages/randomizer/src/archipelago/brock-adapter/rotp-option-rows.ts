/* @layer shared-game @kind logic */
import { exportedOptionsOf } from '@drizztdourden08/brock-randomizer/archipelago';
import { optionCatalog } from '../../world/options';
import { optionText } from '../../world/options/option-text';
import type { ExportedOption } from '@drizztdourden08/brock-randomizer/archipelago';

const rotpOptionRows = (): readonly ExportedOption[] =>
  exportedOptionsOf(optionCatalog.map((option) => ({ ...option, displayName: optionText(option.displayName) })));

export { rotpOptionRows };
