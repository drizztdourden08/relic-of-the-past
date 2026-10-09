/* @layer shared-game @kind logic */
import { DEFAULT_STORY_GATES } from '../../story-gates/story-gates.data';
import type { StoryGateSetting } from '../../story-gates/story-gate.type';
import type { World } from '../../world.type';

const storyGatesOf = (world: World): StoryGateSetting => world.options.storyGates ?? DEFAULT_STORY_GATES;

export { storyGatesOf };
