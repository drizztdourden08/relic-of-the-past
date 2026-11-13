/* @layer shared-input @kind types */
type SnapSide = 'start' | 'center' | 'end';

interface SnapGuide {
  side: SnapSide;
  at: number;
}

interface SnapGuides {
  x: SnapGuide;
  y: SnapGuide;
}

export type { SnapGuide, SnapGuides, SnapSide };
