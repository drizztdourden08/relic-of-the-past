/* @layer renderer-app @kind config */
import { useProfilesStore } from '@drizztdourden08/brock-react';
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';
import { runKindOfProfile } from '@app/lib/game/randomizer-client';

const meta: ScreenMeta = { title: 'Online', icon: 'globe', order: 3, keywords: ['online', 'archipelago', 'multiworld', 'deathlink', 'notifications'] };

const noticeHint = 'On, a notice pops up when this happens during an online session.';
const noticeWords = 'notification toast online archipelago';

const online: Section[] = [
  {
    id: 'online-session',
    title: 'Session',
    items: [
      { key: 'session.deathLink', label: 'DeathLink', description: 'Dying takes down the other DeathLink players, and their deaths take you down.', hint: 'On, your deaths reach the other DeathLink players and theirs reach you.', keywords: 'deathlink death link die archipelago' },
      { key: 'session.trackOtherPlayers', label: 'Track Other Players', description: "Follow the other players' checks on the Network page.", hint: 'On, the Network page lists what the other players find.', keywords: 'track other players checks tracker archipelago' },
    ],
  },
  {
    id: 'online-notifications',
    title: 'Notifications',
    items: [
      { key: 'apNotifyItemReceived', label: 'Items Received', description: 'An item another player found for you.', hint: noticeHint, keywords: `${noticeWords} received item from` },
      { key: 'apNotifyItemSent', label: 'Items Sent', description: 'An item you found for another player.', hint: noticeHint, keywords: `${noticeWords} sent item to` },
      { key: 'apNotifyOwnCheck', label: 'Your Own Items', description: 'An item you found for yourself.', hint: noticeHint, keywords: `${noticeWords} own check found self` },
      { key: 'apNotifyOtherCheck', label: "Other Players' Items", description: 'An item passed between two other players, in any game.', hint: noticeHint, keywords: `${noticeWords} other players checks items` },
      { key: 'apNotifyHintOwn', label: 'Your Hints', description: 'A hint about your items or your locations.', hint: noticeHint, keywords: `${noticeWords} hint` },
      { key: 'apNotifyHintOther', label: 'Other Hints', description: 'A hint between other players.', hint: noticeHint, keywords: `${noticeWords} hint others` },
      { key: 'apNotifyConnection', label: 'Connection', description: 'Connected, lost, reconnected or refused.', hint: noticeHint, keywords: `${noticeWords} connection disconnect reconnect refused lost` },
      { key: 'apNotifyJoin', label: 'Players Joining', description: 'A player joins or leaves the room.', hint: noticeHint, keywords: `${noticeWords} join leave part players` },
      { key: 'apNotifyGoal', label: 'Goals', description: 'A player completes their goal.', hint: noticeHint, keywords: `${noticeWords} goal complete finish` },
      { key: 'apNotifyRelease', label: 'Release and Collect', description: 'A player releases or collects their remaining items.', hint: noticeHint, keywords: `${noticeWords} release collect` },
      { key: 'apNotifyDeathLink', label: 'Deaths', description: 'A DeathLink death, received or sent.', hint: noticeHint, keywords: `${noticeWords} deathlink death died` },
      { key: 'apNotifyChat', label: 'Chat', description: 'Messages from players and the server.', hint: noticeHint, keywords: `${noticeWords} chat message say server` },
    ],
  },
];

const notice: Section[] = [
  { id: 'online-notice', title: 'Online profiles', items: [{ key: 'notice.onlineOnly', label: 'Online profiles only', noDescription: true, hint: 'Open an online randomizer profile to set these.' }] },
];

const isOnlineProfile = (): boolean => runKindOfProfile(useProfilesStore.getState().active?.randomizer) === 'online';

const sections = (): Section[] => {
  if (isOnlineProfile()) return online;
  return notice;
};

export default sections;
export { meta };
