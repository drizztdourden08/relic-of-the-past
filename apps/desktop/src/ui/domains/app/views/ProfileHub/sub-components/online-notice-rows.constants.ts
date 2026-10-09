/* @layer renderer-components @kind constants */
import type { SettingItem } from '../../../compounds/SettingsLayout';
import type { OnlineNoticeKind } from '@shared/randomizer/archipelago/online-notice-settings';
import type { SessionSwitch, SessionSwitchKey } from './online-settings-sections.type';

const NOTICE_ROWS: Readonly<Record<OnlineNoticeKind, Omit<SettingItem, 'key'>>> = {
  itemReceived: { label: 'Items Received', description: 'An item another player found for you.', keywords: 'received item from' },
  itemSent: { label: 'Items Sent', description: 'An item you found for another player.', keywords: 'sent item to' },
  ownCheck: { label: 'Your Own Items', description: 'An item you found for yourself.', keywords: 'own check found self' },
  otherCheck: { label: "Other Players' Items", description: 'An item passed between two other players, in any game.', keywords: 'other players checks items' },
  hintOwn: { label: 'Your Hints', description: 'A hint about your items or your locations.', keywords: 'hint' },
  hintOther: { label: 'Other Hints', description: 'A hint between other players.', keywords: 'hint others' },
  connection: { label: 'Connection', description: 'Connected, lost, reconnected or refused.', keywords: 'connection disconnect reconnect refused lost' },
  join: { label: 'Players Joining', description: 'A player joins or leaves the room.', keywords: 'join leave part players' },
  goal: { label: 'Goals', description: 'A player completes their goal.', keywords: 'goal complete finish' },
  release: { label: 'Release and Collect', description: 'A player releases or collects their remaining items.', keywords: 'release collect' },
  deathLink: { label: 'Deaths', description: 'A DeathLink death, received or sent.', keywords: 'deathlink death died' },
  chat: { label: 'Chat', description: 'Messages from players and the server.', keywords: 'chat message say server' },
};

const SESSION_ITEMS: Readonly<Record<SessionSwitchKey, SessionSwitch>> = {
  'session.deathLink': {
    field: 'deathLink', fallback: false, label: 'DeathLink',
    description: 'Dying takes down the other DeathLink players, and their deaths take you down.',
    keywords: 'deathlink death link die archipelago',
  },
  'session.trackOtherPlayers': {
    field: 'trackOtherPlayers', fallback: true, label: 'Track Other Players',
    description: "Follow the other players' checks on the Network page.",
    keywords: 'track other players checks tracker archipelago',
  },
};

export { NOTICE_ROWS, SESSION_ITEMS };
