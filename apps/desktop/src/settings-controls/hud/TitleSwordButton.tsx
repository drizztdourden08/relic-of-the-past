/* @layer renderer-app @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import { nextTitleSword, titleSwordLabel } from '@rotp/game-data';
import type { ControlContext } from '../settings-controls.type';

const TitleSwordButton = (props: ControlContext) => {
  const { settings, onChange, disabled } = props;
  return (
    <Button variant="secondary" size="sm" disabled={disabled} onClick={() => onChange({ titleSword: nextTitleSword(settings.titleSword) })}>
      {titleSwordLabel(settings.titleSword)}
    </Button>
  );
};

export { TitleSwordButton };
