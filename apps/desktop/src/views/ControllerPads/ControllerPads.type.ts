/* @layer renderer-components @kind types */
interface PadNavEntry {
  id: string;
  label: string;
  connected: boolean;
}

interface ControllerPadsProps {
  initialDeviceKey?: string | null;
  onRunDiagnostics?: (deviceKey: string) => void;
}

interface PadNavBadgeProps {
  connected: boolean;
}

export type { ControllerPadsProps, PadNavBadgeProps, PadNavEntry };
