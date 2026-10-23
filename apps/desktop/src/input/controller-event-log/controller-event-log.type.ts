/* @layer renderer-lib @kind types */
type ControllerEventKind = 'connect' | 'disconnect' | 'hid';

interface ControllerEvent {
  id: string;
  time: number;
  kind: ControllerEventKind;
  text: string;
}

type ControllerEventListener = () => void;

interface ControllerEventStore {
  events: readonly ControllerEvent[];
  lastId: number;
  listeners: Set<ControllerEventListener>;
  stop: (() => void) | null;
}

export type { ControllerEvent, ControllerEventKind, ControllerEventListener, ControllerEventStore };
