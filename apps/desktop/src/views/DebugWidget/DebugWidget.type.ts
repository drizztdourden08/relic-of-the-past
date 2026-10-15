/* @layer renderer-widgets @kind types */
type HudPart = 'main' | 'pause';

interface StateRow {
  label: string;
  value: string;
  mono?: boolean;
}

interface StateSectionData {
  title: string;
  rows: StateRow[];
}

export type { HudPart, StateSectionData };
