/* @layer bridge-wasm @kind logic */
import type { ChannelReport, MsuChannelName } from '../player/engine';
import { msuSessionState } from './msu-session-state';

const msuChannelReport = (name: MsuChannelName): ChannelReport | null =>
  msuSessionState.engine?.reportChannel(name) ?? null;

export { msuChannelReport };
