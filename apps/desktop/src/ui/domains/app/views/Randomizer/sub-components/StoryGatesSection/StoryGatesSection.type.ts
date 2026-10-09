/* @layer renderer-components @kind types */
import type { StoryGateSetting } from '@shared/randomizer/world/story-gates/story-gate.type';
import type { RandomizerOptionRowProps } from '@domains/app/compounds/RandomizerOptionRow';

interface StoryGatesSectionProps {
  setting: StoryGateSetting;
  cellOf?: (key: string) => RandomizerOptionRowProps['impact'];
  onChange?: (setting: StoryGateSetting) => void;
}

export type { StoryGatesSectionProps };
