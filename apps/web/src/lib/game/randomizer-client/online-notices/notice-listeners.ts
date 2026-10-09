/* @layer bridge-wasm @kind logic */
import { createListenerSet } from '../listener-set';
import type { OnlineNotice } from './online-notices.type';

const noticeListeners = createListenerSet<[OnlineNotice]>();

export { noticeListeners };
