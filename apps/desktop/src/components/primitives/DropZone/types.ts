/* @layer renderer-components @kind types */
﻿interface DropZoneProps {
  accept?: string[];
  label?: string;
  hint?: string;
  disabled?: boolean;
  onDrop: (files: File[]) => void;
}

export type {
  DropZoneProps,
};
