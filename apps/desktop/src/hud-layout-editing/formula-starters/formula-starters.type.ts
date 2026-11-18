/* @layer renderer-components @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';

interface FormulaStarter {
  title: Text;
  expr: string;
  select?: string;
}

type StarterRole = 'number' | 'gate';

export type { FormulaStarter, StarterRole };
