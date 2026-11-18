/* @layer renderer-app @kind component */
import { useText } from '@drizztdourden08/brock-react';
import { KeyedControlRow } from '../KeyedControlRow';
import { FIX_STATE_HINTS } from './bugfixes.constants';
import type { BugFixRowProps } from './bugfixes.type';

const BugFixRow = (props: BugFixRowProps) => {
  const { settingKey, checked, onToggle, disabled } = props;
  const text = useText();
  const hints = { on: text(FIX_STATE_HINTS.on), off: text(FIX_STATE_HINTS.off), atRest: FIX_STATE_HINTS.atRest };
  return <KeyedControlRow settingKey={settingKey} input={{ kind: 'toggle', value: checked, onChange: onToggle, hints }} disabled={disabled} />;
};

export { BugFixRow };
