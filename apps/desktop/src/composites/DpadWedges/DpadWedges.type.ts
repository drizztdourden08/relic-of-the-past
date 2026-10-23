/* @layer renderer-components @kind types */
type DpadDirection = 'up' | 'right' | 'down' | 'left';

type DpadWedgeState = Readonly<Record<DpadDirection, boolean>>;

interface DpadWedgesProps {
  cx: number;
  cy: number;
  size: number;
  state: DpadWedgeState;
}

export type { DpadDirection, DpadWedgeState, DpadWedgesProps };
