/* @layer shared-game @kind logic */
import type { OnlineNoticeKind, OnlineNoticeSettingKey } from '@rotp/features';

const noticeSettingKey = (kind: OnlineNoticeKind): OnlineNoticeSettingKey =>
  `apNotify${kind.charAt(0).toUpperCase()}${kind.slice(1)}` as OnlineNoticeSettingKey;

export { noticeSettingKey };
