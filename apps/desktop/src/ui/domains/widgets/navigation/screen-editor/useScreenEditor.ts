/* @layer renderer-widgets @kind hook */
/** Composes the ScreenEditor form-state and derived/codegen hooks into one bundle. */
import { useScreenEditorForm } from './useScreenEditorForm';
import { useScreenEditorDerived } from './useScreenEditorDerived';
import type { ScreenEditorProps } from './screen-editor.type';

const useScreenEditor = (props: ScreenEditorProps) => {
  const form = useScreenEditorForm(props);
  const derived = useScreenEditorDerived(props, form);
  return { ...form, ...derived };
};

type ScreenEditor = ReturnType<typeof useScreenEditor>;

export { useScreenEditor };
export type { ScreenEditor };
