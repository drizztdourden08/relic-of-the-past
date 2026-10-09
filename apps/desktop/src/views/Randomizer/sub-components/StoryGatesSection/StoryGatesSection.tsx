/* @layer renderer-components @kind component */
import { RandomizerOptionGroup } from '@app/compounds/RandomizerOptionGroup';
import { RandomizerOptionRow } from '@app/compounds/RandomizerOptionRow';
import { storyGateValuesOf, storyGatesOfValues } from '@rotp/randomizer';
import { STORY_GATE_OPTIONS, STORY_GATES_TITLE } from './StoryGatesSection.constants';
import type { StoryGatesSectionProps } from './StoryGatesSection.type';

const StoryGatesSection = (props: StoryGatesSectionProps) => {
  const { setting, cellOf, onChange } = props;
  const values = storyGateValuesOf(setting);

  return (
    <RandomizerOptionGroup title={STORY_GATES_TITLE} live className="story-gates">
      {STORY_GATE_OPTIONS.map((option) => (
        <RandomizerOptionRow
          key={option.key}
          option={option}
          value={values[option.key]}
          impact={cellOf?.(option.key)}
          readout={onChange === undefined}
          onChange={onChange === undefined
            ? undefined
            : (next) => onChange(storyGatesOfValues({ ...values, [option.key]: next }))}
        />
      ))}
    </RandomizerOptionGroup>
  );
};

export { StoryGatesSection };
