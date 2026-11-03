/* @layer renderer-appshell @kind types */
interface LaunchTaskContext {
  isCancelled: () => boolean;
  hasRun: () => boolean;
  markRan: () => void;
}

type LaunchTask = (context: LaunchTaskContext) => Promise<void>;

export type { LaunchTask };
