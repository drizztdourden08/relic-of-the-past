/* @layer renderer-components @kind types */
import type { StoryGateSetting } from '@shared/randomizer/world/story-gates/story-gate.type';
import type { RandomizerOptionRowProps } from '@domains/app/compounds/RandomizerOptionRow';

interface StoryGatesSectionProps {
  setting: StoryGateSetting;
  /** The pool impact cell of a row, where the panel has one. */
  cellOf?: (key: string) => RandomizerOptionRowProps['impact'];
  /** Absent for a read-only view. */
  onChange?: (setting: StoryGateSetting) => void;
}

export type { StoryGatesSectionProps };
