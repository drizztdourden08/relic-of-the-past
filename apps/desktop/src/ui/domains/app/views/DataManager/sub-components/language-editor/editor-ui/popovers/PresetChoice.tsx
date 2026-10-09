/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Button } from '@drizztdourden08/tessera/primitives';
import type { PresetChoiceProps } from './PresetChoice.type';

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
