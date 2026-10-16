/* @layer renderer-components @kind component */
import { EntryProperties } from './EntryProperties';
import { SetProperties } from './SetProperties';
import type { LanguagePropertiesProps } from './studio-frame.type';

const LanguageProperties = (props: LanguagePropertiesProps) => {
  const { set, warnings, selection, readOnly, onNote } = props;

  return (
    <>
      {selection && <EntryProperties selection={selection} readOnly={readOnly} onNote={onNote} />}
      <SetProperties set={set} warnings={warnings} />
    </>
  );
};

export { LanguageProperties };
