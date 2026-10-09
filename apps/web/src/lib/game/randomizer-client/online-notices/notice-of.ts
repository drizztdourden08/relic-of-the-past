/* @layer bridge-wasm @kind logic */
import type { OnlineNoticeKind } from '@shared/randomizer/archipelago/online-notice-settings';
import type { NoticePart, OnlineNotice } from './online-notices.type';

const noticeOf = (kind: OnlineNoticeKind, parts: readonly NoticePart[], counterpart?: string): OnlineNotice => ({
  kind,
  text: parts.map((part) => part.text).join(''),
  parts,
  ...(counterpart === undefined ? {} : { counterpart }),
});

export { noticeOf };
