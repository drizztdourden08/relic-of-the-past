/* @layer shared @kind types */
type GbaGroup =
  | 'Extra content' | 'Combat & items' | 'World & exploration'
  | 'Enemies & bosses' | 'Presentation' | 'Audio & voice'
  | 'Text & naming' | 'Save & meta' | 'Fixes' | 'Removed';

type GbaDifference = {
  id: string;
  group: GbaGroup;
  label: string;
  detail: string;
  evidence: 'documented' | 'in-progress';
};

export type { GbaDifference, GbaGroup };
