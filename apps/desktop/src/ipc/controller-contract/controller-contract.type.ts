/* @layer shared-ipc @kind types */
interface ControllerInvokeContract {
  'controller:write-debug-capture': (name: string, data: unknown) => Promise<string>;
}

export type { ControllerInvokeContract };
