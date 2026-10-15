/* @layer shared-game @kind types */
type CodeRisk = 'safe' | 'structural' | 'dangerous';

type CodeScope = 'positional' | 'message';

type CodeParamRange = { min: number; max: number };

type CodeInfo = {
  name: string;
  label: string;
  description: string;
  risk: CodeRisk;
  scope: CodeScope;
  param?: CodeParamRange;
  offerInMenu: boolean;
};

type StructuralEntry = { id: number; reason: string };

export type { CodeInfo, StructuralEntry };
