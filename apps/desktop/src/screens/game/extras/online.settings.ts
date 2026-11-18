/* @layer renderer-app @kind config */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta, SectionDef } from '@drizztdourden08/brock-react';
import { isOnlineExperimental } from '@app/shell/show-rules';

const meta: ScreenMeta = { title: 'Online', icon: 'globe', order: 3, when: isOnlineExperimental, keywords: ['online', 'archipelago', 'multiworld', 'deathlink', 'notifications'] };

const noticeWords = 'notification toast online archipelago';

const online: SectionDef[] = [
  {
    id: 'online-session',
    title: msg('settings-online:section.online-session.title'),
    items: [
      { key: 'session.deathLink', label: msg('settings-online:session.death-link.label'), description: msg('settings-online:session.death-link.description'), hint: msg('settings-online:session.death-link.hint'), keywords: 'deathlink death link die archipelago' },
      { key: 'session.trackOtherPlayers', label: msg('settings-online:session.track-other-players.label'), description: msg('settings-online:session.track-other-players.description'), hint: msg('settings-online:session.track-other-players.hint'), keywords: 'track other players checks tracker archipelago' },
    ],
  },
  {
    id: 'online-notifications',
    title: msg('settings-online:section.online-notifications.title'),
    items: [
      { key: 'apNotifyItemReceived', label: msg('settings-online:ap-notify-item-received.label'), description: msg('settings-online:ap-notify-item-received.description'), keywords: `${noticeWords} received item from` },
      { key: 'apNotifyItemSent', label: msg('settings-online:ap-notify-item-sent.label'), description: msg('settings-online:ap-notify-item-sent.description'), keywords: `${noticeWords} sent item to` },
      { key: 'apNotifyOwnCheck', label: msg('settings-online:ap-notify-own-check.label'), description: msg('settings-online:ap-notify-own-check.description'), keywords: `${noticeWords} own check found self` },
      { key: 'apNotifyOtherCheck', label: msg('settings-online:ap-notify-other-check.label'), description: msg('settings-online:ap-notify-other-check.description'), keywords: `${noticeWords} other players checks items` },
      { key: 'apNotifyHintOwn', label: msg('settings-online:ap-notify-hint-own.label'), description: msg('settings-online:ap-notify-hint-own.description'), keywords: `${noticeWords} hint` },
      { key: 'apNotifyHintOther', label: msg('settings-online:ap-notify-hint-other.label'), description: msg('settings-online:ap-notify-hint-other.description'), keywords: `${noticeWords} hint others` },
      { key: 'apNotifyConnection', label: msg('settings-online:ap-notify-connection.label'), description: msg('settings-online:ap-notify-connection.description'), keywords: `${noticeWords} connection disconnect reconnect refused lost` },
      { key: 'apNotifyJoin', label: msg('settings-online:ap-notify-join.label'), description: msg('settings-online:ap-notify-join.description'), keywords: `${noticeWords} join leave part players` },
      { key: 'apNotifyGoal', label: msg('settings-online:ap-notify-goal.label'), description: msg('settings-online:ap-notify-goal.description'), keywords: `${noticeWords} goal complete finish` },
      { key: 'apNotifyRelease', label: msg('settings-online:ap-notify-release.label'), description: msg('settings-online:ap-notify-release.description'), keywords: `${noticeWords} release collect` },
      { key: 'apNotifyDeathLink', label: msg('settings-online:ap-notify-death-link.label'), description: msg('settings-online:ap-notify-death-link.description'), keywords: `${noticeWords} deathlink death died` },
      { key: 'apNotifyChat', label: msg('settings-online:ap-notify-chat.label'), description: msg('settings-online:ap-notify-chat.description'), keywords: `${noticeWords} chat message say server` },
    ],
  },
];

const sections = (): SectionDef[] => online;

export default sections;
export { meta };
