/* @layer renderer-components @kind logic */
import type { SettingItem } from '../../../compounds/SettingsLayout';
import { noticeSettingKey } from '@shared/randomizer/archipelago/online-notice-settings';
import type { OnlineNoticeKind } from '@shared/randomizer/archipelago/online-notice-settings';
import { NOTICE_ROWS } from './online-notice-rows.constants';

const noticeItem = (kind: OnlineNoticeKind): SettingItem => {
  const { keywords, ...row } = NOTICE_ROWS[kind];
  return { key: noticeSettingKey(kind), ...row, keywords: `notification toast online archipelago ${keywords ?? ''}` };
};

export { noticeItem };
