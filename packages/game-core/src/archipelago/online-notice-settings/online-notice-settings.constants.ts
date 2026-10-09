/* @layer shared-game @kind constants */
import { noticeSettingKey } from './notice-setting-key';
import { ONLINE_NOTICE_KINDS } from '@rotp/features';
import type { OnlineNoticeSettingKey, OnlineNoticeSettings } from '@rotp/features';

const ONLINE_NOTICE_DEFAULTS: OnlineNoticeSettings = {
  apNotifyItemReceived: true,
  apNotifyItemSent: true,
  apNotifyOwnCheck: false,
  apNotifyOtherCheck: false,
  apNotifyHintOwn: true,
  apNotifyHintOther: false,
  apNotifyConnection: true,
  apNotifyJoin: false,
  apNotifyGoal: true,
  apNotifyRelease: true,
  apNotifyDeathLink: true,
  apNotifyChat: false,
};

const ONLINE_NOTICE_SETTING_KEYS: readonly OnlineNoticeSettingKey[] = ONLINE_NOTICE_KINDS.map(noticeSettingKey);

export { ONLINE_NOTICE_DEFAULTS, ONLINE_NOTICE_SETTING_KEYS };
