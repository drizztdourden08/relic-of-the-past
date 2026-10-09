/* @layer shared-game @kind logic */
import { noticeSettingKey } from './notice-setting-key';
import { ONLINE_NOTICE_DEFAULTS } from './online-notice-settings.constants';
import type { OnlineNoticeKind, OnlineNoticeSettings } from '@rotp/features';

const isNoticeKindShown = (settings: Partial<OnlineNoticeSettings> | null, kind: OnlineNoticeKind): boolean => {
  const key = noticeSettingKey(kind);
  return settings?.[key] ?? ONLINE_NOTICE_DEFAULTS[key];
};

export { isNoticeKindShown };
