/* @layer renderer-app @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import { nextTitleSword, titleSwordLabel } from '@rotp/game-data';
import { KeyedControlRow } from '../KeyedControlRow';
import type { ControlContext } from '../settings-controls.type';

const TitleSwordRow = (props: ControlContext) => {
  const { settings, onChange, disabled } = props;
  const step = (
    <Button variant="secondary" size="sm" disabled={disabled} onClick={() => onChange({ titleSword: nextTitleSword(settings.titleSword) })}>
      {titleSwordLabel(settings.titleSword)}
    </Button>
  );
  return <KeyedControlRow settingKey="titleSword" input={{ kind: 'custom', control: step }} disabled={disabled} />;
};

export { TitleSwordRow };
