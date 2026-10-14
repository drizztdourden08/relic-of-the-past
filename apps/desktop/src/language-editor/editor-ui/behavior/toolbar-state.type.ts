/* @layer renderer-components @kind types */
import type { EditorToolbarProps } from '../EditorToolbar.type';

type ToolbarStateParams = Pick<EditorToolbarProps, 'onUndo' | 'onRedo' | 'onEndBox' | 'onInsert'>;

export type { ToolbarStateParams };
