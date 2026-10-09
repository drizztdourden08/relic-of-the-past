/* @layer renderer-app @kind component */
import { SettingsRow } from '@drizztdourden08/tessera/composites';
import type { ControlRowProps } from './ControlRow.type';
import './ControlRow.css';

const ControlRow = (props: ControlRowProps) => {
  const { id, title, hint, description, input, disabled = false, changed, onReset } = props;
  const text = description === undefined || description === '' ? { noDescription: true as const } : { description };
  return (
    <SettingsRow
      id={id}
      title={title}
      hint={hint}
      {...text}
      input={input}
      disabled={disabled}
      changed={changed}
      onReset={onReset}
      className="control-row"
    />
  );
};

export { ControlRow };
