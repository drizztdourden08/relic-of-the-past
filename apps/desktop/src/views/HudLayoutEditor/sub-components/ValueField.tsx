/* @layer renderer-components @kind component */
import { useEditorStep } from '@app/hud-layout-editing/editor-step';
import { ValueInput } from './ValueInput';
import type { ValueFieldProps } from './ValueField.type';

const ValueField = (props: ValueFieldProps) => {
  const editorStep = useEditorStep();
  return <ValueInput {...props} step={props.step ?? editorStep} role="number" />;
};

export { ValueField };
