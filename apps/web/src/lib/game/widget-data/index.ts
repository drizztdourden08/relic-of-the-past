/* @layer bridge-wasm @kind barrel */
export { hostWidgetId, isWidgetHost } from './widget-host';
export { installWidgetPublisher, publishFrames, publishGameRunning, publishProfile, publishSettings } from './publish-widget-data';
export { getHostState, installWidgetReceiver, onHostState } from './receive-widget-data';
export type { HostState } from './receive-widget-data';
export type { RelaySlice } from './relay-slices';
