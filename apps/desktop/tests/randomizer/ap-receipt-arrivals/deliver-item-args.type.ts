/* @layer tests @kind type */
type DeliverItemArgs = [
  id: number, label: string, source: string, messageId?: number | (() => number), onComplete?: () => void,
  onGranted?: () => void,
];

export type { DeliverItemArgs };
