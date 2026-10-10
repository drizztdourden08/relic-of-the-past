/* @layer renderer-components @kind types */
interface FormulaStarter {
  title: string;
  expr: string;
  select?: string;
}

type StarterRole = 'number' | 'gate';

export type { FormulaStarter, StarterRole };
