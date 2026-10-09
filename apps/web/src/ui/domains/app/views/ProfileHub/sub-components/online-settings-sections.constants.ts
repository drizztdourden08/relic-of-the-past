/* @layer renderer-components @kind constants */
import type { Section } from '../../../compounds/SettingsLayout';
import { ONLINE_NOTICE_KINDS } from '@shared/randomizer/archipelago/online-notice-settings';
import { SESSION_ITEMS } from './online-notice-rows.constants';
import { noticeItem } from './notice-item';
import { sessionItem } from './session-item';
import type { SessionSwitchKey } from './online-settings-sections.type';

const SECTIONS: Section[] = [
  { id: 'online-session', title: 'Session', items: (Object.keys(SESSION_ITEMS) as SessionSwitchKey[]).map(sessionItem) },
  { id: 'online-notifications', title: 'Notifications', items: ONLINE_NOTICE_KINDS.map(noticeItem) },
];

export { SECTIONS, SESSION_ITEMS };
