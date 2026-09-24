/* @layer shared-ipc @kind types */
/**
 * The invoke channels of widgets in their own OS window: open one at its
 * remembered facts, list the open ones, set a pin, read the window facts. Split
 * out of `InvokeContract` (which extends this) only for the line cap.
 */
import type { PinMode, PoppedWidget, PoppedWindowState } from '@shared/types/widget-layout';

interface WidgetInvokeContract {
  'widget:popOut': (id: string, popped?: Omit<PoppedWidget, 'id'>) => Promise<void>;
  'widget:listPopped': () => Promise<string[]>;
  /** Answers with the mode in effect. */
  'widget:setPin': (id: string, mode: PinMode) => Promise<PinMode>;
  'widget:getWindowState': (id: string) => Promise<PoppedWindowState | null>;
}

export type { WidgetInvokeContract };
