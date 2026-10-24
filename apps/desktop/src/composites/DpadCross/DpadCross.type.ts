/* @layer renderer-components @kind types */
type DpadDirection = 'up' | 'right' | 'down' | 'left';

type DpadPressState = Readonly<Record<DpadDirection, boolean>>;

interface DpadCrossProps {
  cx: number;
  cy: number;
  size: number;
  state: DpadPressState;
}

interface CrossGlyph {
  body: string;
  arms: Readonly<Record<DpadDirection, string>>;
  min: number;
  span: number;
}

interface PathExtent {
  min: number;
  span: number;
}

export type { CrossGlyph, DpadCrossProps, DpadDirection, DpadPressState, PathExtent };
