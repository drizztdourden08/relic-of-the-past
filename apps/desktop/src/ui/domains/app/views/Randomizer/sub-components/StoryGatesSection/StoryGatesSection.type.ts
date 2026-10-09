/* @layer renderer-components @kind types */
import type { StoryGateSetting } from '@rotp/randomizer';
import type { RandomizerOptionRowProps } from '@domains/app/compounds/RandomizerOptionRow';

interface StoryGatesSectionProps {
  setting: StoryGateSetting;
  cellOf?: (key: string) => RandomizerOptionRowProps['impact'];
  onChange?: (setting: StoryGateSetting) => void;
}

export type { StoryGatesSectionProps };
