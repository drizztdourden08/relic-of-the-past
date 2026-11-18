/* @layer renderer-components @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';

interface FormulaName {
  name: string;
  note: Text;
  unavailable?: Text;
}

interface FormulaGroup {
  title: Text;
  items: readonly FormulaName[];
}

export type { FormulaGroup, FormulaName };
