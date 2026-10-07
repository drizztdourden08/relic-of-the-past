/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface HeroProps {
  /** Names the section for assistive tech. */
  ariaLabel: string;
  /** Fills the hero behind everything; the host picks the scene. */
  backdrop?: ReactNode;
  /** A piece standing in the open space beside the intro, behind the details. */
  art?: ReactNode;
  /** Small buttons in the top-right corner. */
  tools?: ReactNode;
  /** Bottom-left: the eyebrow, the title and the actions. */
  intro: ReactNode;
  /** Bottom-right, beside the intro. */
  side?: ReactNode;
  /** Along the bottom edge, such as the facts strip. */
  bottom?: ReactNode;
  /** A modifier class that sets the hero's size variables or places its art. */
  className?: string;
}

export type { HeroProps };
