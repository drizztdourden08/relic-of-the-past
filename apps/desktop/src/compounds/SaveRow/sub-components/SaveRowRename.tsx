/* @layer renderer-components @kind component */
import { TextInput } from '@drizztdourden08/tessera/primitives';
import { NAME_MAX_LENGTH } from '../SaveRow.constants';
import { useRename } from '../behavior/useRename';
import type { SaveRowRenameProps } from '../SaveRow.type';

const SaveRowRename = ({ name, onEnd }: SaveRowRenameProps) => {
  const rename = useRename(name, onEnd);
  return (
    <TextInput
      aria-label="Save name"
      className="save-row__rename"
      value={rename.value}
      onChange={(event) => rename.setValue(event.target.value)}
      onBlur={rename.commit}
      onKeyDown={rename.handleKeyDown}
      onFocus={(event) => event.target.select()}
      maxLength={NAME_MAX_LENGTH}
      autoFocus
    />
  );
};

export { SaveRowRename };
