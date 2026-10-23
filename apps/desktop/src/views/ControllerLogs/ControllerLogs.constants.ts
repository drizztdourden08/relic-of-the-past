/* @layer renderer-components @kind constants */
import type { LogKindDef } from '@drizztdourden08/tessera/composites';
import type { ControllerEventKind } from '@app/input/controller-event-log/controller-event-log.type';

const CONTROLLER_LOG_KINDS: readonly LogKindDef[] = [
  { id: 'connect', label: 'Connect', tone: 'secondary', toneMessage: true },
  { id: 'disconnect', label: 'Disconnect', tone: 'danger', toneMessage: true },
  { id: 'hid', label: 'HID', tone: 'dim', toneMessage: true },
];

const CONTROLLER_LOG_TAGS: Readonly<Record<ControllerEventKind, string>> = {
  connect: 'CONNECT',
  disconnect: 'DISCONNECT',
  hid: 'HID',
};

const CONTROLLER_LOG_COUNT_LABEL = 'lines';

const CONTROLLER_LOG_EMPTY = 'Waiting for controller activity...';

export { CONTROLLER_LOG_COUNT_LABEL, CONTROLLER_LOG_EMPTY, CONTROLLER_LOG_KINDS, CONTROLLER_LOG_TAGS };
