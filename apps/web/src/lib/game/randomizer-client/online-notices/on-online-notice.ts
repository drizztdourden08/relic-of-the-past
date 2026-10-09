/* @layer bridge-wasm @kind logic */
import { noticeListeners } from './notice-listeners';
import type { OnlineNoticeListener } from './online-notices.type';

const onOnlineNotice = (listener: OnlineNoticeListener): (() => void) => noticeListeners.add(listener);

export { onOnlineNotice };
