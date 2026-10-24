/* @layer shared-game @kind logic */
import { parseOptionSchema } from '@drizztdourden08/archipelia-client-kit';
import type { OptionSchema } from '@drizztdourden08/archipelia-client-kit';
import { exportOptions } from '../export/export-options';

let parsed: OptionSchema | undefined;

const optionSchema = (): OptionSchema => {
  parsed ??= parseOptionSchema(exportOptions());
  return parsed;
};

export { optionSchema };
