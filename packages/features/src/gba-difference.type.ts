/* @layer shared @kind types */
type GbaGroup =
  | 'Extra content' | 'Combat & items' | 'World & exploration'
  | 'Enemies & bosses' | 'Presentation' | 'Audio & voice'
  | 'Text & naming' | 'Save & meta' | 'Fixes' | 'Removed';

type GbaStatus = 'in-progress' | 'not-started' | 'excluded';

type GbaDifference = {
  id: string;
  group: GbaGroup;
  label: string;
  detail: string;
  status: GbaStatus;
};

export type { GbaDifference, GbaGroup, GbaStatus };
