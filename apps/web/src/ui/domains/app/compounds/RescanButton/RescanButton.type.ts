/* @layer renderer-components @kind types */
interface RescanButtonProps {
  /** True from click until the next device snapshot arrives, or a timeout elapses. */
  isPending: boolean;
  onRescan: () => void;
}

export type { RescanButtonProps };
