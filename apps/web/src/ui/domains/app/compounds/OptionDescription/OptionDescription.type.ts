/* @layer renderer-components @kind types */
import type { OptionDescription } from '@shared/randomizer/ap-world/option-description.type';

interface OptionDescriptionProps {
  /** The catalog's own wording: one sentence, or a list of term/detail lines. */
  description: OptionDescription;
  /** The caller's text class — it decides the size and the base colour. */
  className?: string;
}

export type { OptionDescriptionProps };
