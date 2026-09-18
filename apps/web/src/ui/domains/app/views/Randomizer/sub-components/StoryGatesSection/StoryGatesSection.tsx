/* @layer renderer-components @kind component */
/**
 * The story gates group of an options panel: one plain row per gate, in the order the
 * catalog lists them. The rows read and write through the same key mapping the snapshot
 * uses (story-gate-from-snapshot.ts), so a row and a stored value can never disagree.
 * The run view shares the section read-only, so a stored seed shows what it was rolled with.
 */
import { RandomizerOptionGroup } from '@domains/app/compounds/RandomizerOptionGroup';
import { RandomizerOptionRow } from '@domains/app/compounds/RandomizerOptionRow';
import { storyGateValuesOf, storyGatesOfValues } from '@shared/randomizer/ap-world/story-gates/story-gate-from-snapshot';
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
          onChange={onChange === undefined
            ? undefined
            : (next) => onChange(storyGatesOfValues({ ...values, [option.key]: next }))}
        />
      ))}
    </RandomizerOptionGroup>
  );
};

export { StoryGatesSection };
