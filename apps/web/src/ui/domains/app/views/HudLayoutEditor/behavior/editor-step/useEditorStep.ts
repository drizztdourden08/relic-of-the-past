/* @layer renderer-components @kind hook */
import { useContext } from 'react';
import { EditorStepContext } from './editor-step-context';

const useEditorStep = (): number => useContext(EditorStepContext);

export { useEditorStep };
