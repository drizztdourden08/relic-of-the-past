/* @layer renderer-components @kind types */
interface FormulaName {
  name: string;
  note: string;
  unavailable?: string;
}

interface FormulaGroup {
  title: string;
  items: readonly FormulaName[];
}

export type { FormulaGroup, FormulaName };
