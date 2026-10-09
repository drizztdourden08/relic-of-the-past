/* @layer shared-game @kind types */
type StateGroup = 'movement' | 'combat' | 'carrying' | 'water' | 'hazard' | 'special';

interface StateLabel {
  action: number;
  label: string;
  group: StateGroup;
  from: string;
}

export type { StateGroup, StateLabel };
