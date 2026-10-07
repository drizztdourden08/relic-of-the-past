/* @layer renderer-components @kind types */

interface StarsProps {
  /** The average of the ratings, 1 to 5; null when there are none yet. */
  average: number | null;
  /** How many ratings the average is made of; shown after it when given. */
  count?: number;
  className?: string;
}

export type { StarsProps };
