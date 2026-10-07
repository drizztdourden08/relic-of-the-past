/* @layer renderer-components @kind types */

interface FlagPillProps {
  label: string;
  on: boolean;
  /** The words for the two states; `on` and `off` by default. */
  onText?: string;
  offText?: string;
  className?: string;
}

export type { FlagPillProps };
