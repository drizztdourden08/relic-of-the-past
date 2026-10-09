/* @layer shared-game @kind types */
import type { ONLINE_NOTICE_KINDS } from './online-notice-kinds.constants';

type OnlineNoticeKind = typeof ONLINE_NOTICE_KINDS[number];

type OnlineNoticeSettingKey = `apNotify${Capitalize<OnlineNoticeKind>}`;

type OnlineNoticeSettings = Record<OnlineNoticeSettingKey, boolean>;

export type { OnlineNoticeKind, OnlineNoticeSettingKey, OnlineNoticeSettings };
