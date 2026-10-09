/* @layer renderer-appshell @kind types */
import type { ConfirmDialog } from '../App.type';

interface AppOverlaysParams {
  showDialog: (config: ConfirmDialog) => void;
  dismissDialog: () => void;
}

export type { AppOverlaysParams };
