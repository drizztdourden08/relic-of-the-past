/* @layer renderer-components @kind component */
import { useEditorStep } from '../behavior/editor-step';
import { ValueInput } from './ValueInput';
import type { ValueFieldProps } from './ValueField.type';

const ValueField = (props: ValueFieldProps) => {
  const editorStep = useEditorStep();
  return <ValueInput {...props} step={props.step ?? editorStep} role="number" />;
};

export { ValueField };
export type { ValueFieldProps } from './ValueField.type';
