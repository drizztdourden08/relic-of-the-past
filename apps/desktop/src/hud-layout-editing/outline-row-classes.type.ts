/* @layer renderer-components @kind types */
interface OutlineRowClassInput {
  selected: boolean;
  dragging: boolean;
  dropClass: string;
  locked: string | undefined;
  isScreen: boolean | undefined;
  shaking: boolean | undefined;
}

export type { OutlineRowClassInput };
