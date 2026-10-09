/* @layer bridge-wasm @kind logic */
import { noticeListeners } from './notice-listeners';
import type { OnlineNotice } from './online-notices.type';

const emitOnlineNotice = (notice: OnlineNotice): void => noticeListeners.emit(notice);

export { emitOnlineNotice };
