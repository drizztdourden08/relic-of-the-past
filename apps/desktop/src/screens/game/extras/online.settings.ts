/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';
import { withOwnRows } from '@app/settings-controls/own-row-sections';
import { isOnlineExperimental } from '@app/shell/show-rules';

const meta: ScreenMeta = { title: 'Online', icon: 'globe', order: 3, when: isOnlineExperimental, keywords: ['online', 'archipelago', 'multiworld', 'deathlink', 'notifications'] };

const noticeWords = 'notification toast online archipelago';

const online: Section[] = [
  {
    id: 'online-session',
    title: 'Session',
    items: [
      { key: 'session.deathLink', label: 'DeathLink', description: 'Dying takes down the other DeathLink players, and their deaths take you down.', hint: 'The session reconnects to apply it.', keywords: 'deathlink death link die archipelago' },
      { key: 'session.trackOtherPlayers', label: 'Track Other Players', description: "Follow the other players' checks on the Network page.", hint: 'The session reconnects to apply it.', keywords: 'track other players checks tracker archipelago' },
    ],
  },
  {
    id: 'online-notifications',
    title: 'Notifications',
    items: [
      { key: 'apNotifyItemReceived', label: 'Items Received', description: 'An item another player found for you.', keywords: `${noticeWords} received item from` },
      { key: 'apNotifyItemSent', label: 'Items Sent', description: 'An item you found for another player.', keywords: `${noticeWords} sent item to` },
      { key: 'apNotifyOwnCheck', label: 'Your Own Items', description: 'An item you found for yourself.', keywords: `${noticeWords} own check found self` },
      { key: 'apNotifyOtherCheck', label: "Other Players' Items", description: 'An item passed between two other players, in any game.', keywords: `${noticeWords} other players checks items` },
      { key: 'apNotifyHintOwn', label: 'Your Hints', description: 'A hint about your items or your locations.', keywords: `${noticeWords} hint` },
      { key: 'apNotifyHintOther', label: 'Other Hints', description: 'A hint between other players.', keywords: `${noticeWords} hint others` },
      { key: 'apNotifyConnection', label: 'Connection', description: 'Connected, lost, reconnected or refused.', keywords: `${noticeWords} connection disconnect reconnect refused lost` },
      { key: 'apNotifyJoin', label: 'Players Joining', description: 'A player joins or leaves the room.', keywords: `${noticeWords} join leave part players` },
      { key: 'apNotifyGoal', label: 'Goals', description: 'A player completes their goal.', keywords: `${noticeWords} goal complete finish` },
      { key: 'apNotifyRelease', label: 'Release and Collect', description: 'A player releases or collects their remaining items.', keywords: `${noticeWords} release collect` },
      { key: 'apNotifyDeathLink', label: 'Deaths', description: 'A DeathLink death, received or sent.', keywords: `${noticeWords} deathlink death died` },
      { key: 'apNotifyChat', label: 'Chat', description: 'Messages from players and the server.', keywords: `${noticeWords} chat message say server` },
    ],
  },
];

const sections = (): Section[] => withOwnRows(online);

export default sections;
export { meta };
