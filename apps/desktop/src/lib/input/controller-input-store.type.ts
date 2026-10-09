/* @layer renderer-lib @kind types */
interface ControllerInputState {
  deviceKey: string;
  buttons: boolean[];
  axes: number[];
  timestamp: number;
  rawSticks?: [number, number, number, number];
  rawBytes?: Uint8Array;
  reportId?: number;
}

interface HidRawReportEvent {
  deviceKey: string;
  reportId: number;
  bytes: Uint8Array;
  timestamp: number;
}

type ControllerStateListener = (state: ControllerInputState) => void;
type HidRawReportListener = (report: HidRawReportEvent) => void;
type ControllerDiagListener = (msg: string) => void;
type ControllerDisconnectListener = (deviceKey: string, deviceName: string) => void;

export type {
  ControllerDiagListener,
  ControllerDisconnectListener,
  ControllerInputState,
  ControllerStateListener,
  HidRawReportEvent,
  HidRawReportListener,
};
