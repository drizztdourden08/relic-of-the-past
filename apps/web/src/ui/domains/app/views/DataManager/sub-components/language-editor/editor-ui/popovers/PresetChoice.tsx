/* @layer renderer-components @kind component */
/**
 * One preset in a value list. Its own component so the click handler is bound
 * once per value rather than rebuilt inline on every render of the list.
 */
import { useCallback } from 'react';
import { Button } from '@ds/primitives';
import type { Preset } from './presets';

type PresetChoiceProps = {
  preset: Preset;
  onPick: (param: number) => void;
};

const PresetChoice = (props: PresetChoiceProps) => {
  const { preset, onPick } = props;

  const handleClick = useCallback(() => onPick(preset.param), [onPick, preset.param]);

  return (
    <Button className="preset-popover__choice" variant="tertiary" size="sm" onClick={handleClick}>
      {preset.label}
    </Button>
  );
};

export { PresetChoice };
export type { PresetChoiceProps };
