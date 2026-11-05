/* @layer shared-game @kind logic */
import { exportedOptionsOf } from '@drizztdourden08/brock-randomizer/archipelago';
import { optionCatalog } from '../../world/options';
import type { ExportedOption } from '@drizztdourden08/brock-randomizer/archipelago';

let rows: readonly ExportedOption[] | undefined;

const rotpOptionRows = (): readonly ExportedOption[] => {
  rows ??= exportedOptionsOf(optionCatalog);
  return rows;
};

export { rotpOptionRows };
