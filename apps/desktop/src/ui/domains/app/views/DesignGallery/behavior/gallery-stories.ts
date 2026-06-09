/* @layer renderer-app @kind data */
import type { ComponentType } from 'react';
import { ColorStory } from '../sub-components/stories/ColorStory';
import { ScaleStory } from '../sub-components/stories/ScaleStory';
import { ButtonStory } from '../sub-components/stories/ButtonStory';
import { FormControlStory } from '../sub-components/stories/FormControlStory';
import { InputStory } from '../sub-components/stories/InputStory';
import { FeedbackStory } from '../sub-components/stories/FeedbackStory';
import { ContainerStory } from '../sub-components/stories/ContainerStory';
import { LayoutStory } from '../sub-components/stories/LayoutStory';
import { DataStory } from '../sub-components/stories/DataStory';

interface StoryMeta {
  id: string;
  label: string;
  group: string;
  Component: ComponentType;
}

const STORIES: StoryMeta[] = [
  { id: 'color', label: 'Color & surfaces', group: 'Foundations', Component: ColorStory },
  { id: 'scale', label: 'Type · spacing · elevation', group: 'Foundations', Component: ScaleStory },
  { id: 'buttons', label: 'Buttons & badges', group: 'Components', Component: ButtonStory },
  { id: 'form', label: 'Form controls', group: 'Components', Component: FormControlStory },
  { id: 'inputs', label: 'Inputs', group: 'Components', Component: InputStory },
  { id: 'feedback', label: 'Feedback', group: 'Components', Component: FeedbackStory },
  { id: 'data', label: 'Data & headers', group: 'Components', Component: DataStory },
  { id: 'layout', label: 'Layout', group: 'Components', Component: LayoutStory },
  { id: 'containers', label: 'Containers', group: 'Components', Component: ContainerStory },
];

export type { StoryMeta };
export { STORIES };
