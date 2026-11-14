/* @layer renderer-components @kind types */

type EdgeSide = 'start' | 'end';

interface EdgeSwipeHintProps {
  startLabel: string;
  endLabel: string;
}

interface EdgeHintSpec {
  side: EdgeSide;
  icon: 'chevron-right' | 'chevron-left';
}

export type { EdgeHintSpec, EdgeSwipeHintProps };
