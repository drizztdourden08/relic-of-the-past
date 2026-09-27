/* @layer shared-game @kind logic */
/**
 * The kinds of notice an online session raises, and the setting that shows or hides each
 * one as a toast. One boolean per kind, stored with the rest of the profile's settings.
 */

const ONLINE_NOTICE_KINDS = [
  'itemReceived', 'itemSent', 'ownCheck', 'otherCheck', 'hintOwn', 'hintOther',
  'connection', 'join', 'goal', 'release', 'deathLink', 'chat',
] as const;

type OnlineNoticeKind = typeof ONLINE_NOTICE_KINDS[number];

type OnlineNoticeSettingKey = `apNotify${Capitalize<OnlineNoticeKind>}`;

type OnlineNoticeSettings = Record<OnlineNoticeSettingKey, boolean>;

const noticeSettingKey = (kind: OnlineNoticeKind): OnlineNoticeSettingKey =>
  `apNotify${kind.charAt(0).toUpperCase()}${kind.slice(1)}` as OnlineNoticeSettingKey;

/** What a new profile shows: what happens to this player on, the rest of the room off. */
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

/** Whether a kind is shown; a setting a profile never saved reads as its default. */
const isNoticeKindShown = (settings: Partial<OnlineNoticeSettings> | null, kind: OnlineNoticeKind): boolean => {
  const key = noticeSettingKey(kind);
  return settings?.[key] ?? ONLINE_NOTICE_DEFAULTS[key];
};

export {
  isNoticeKindShown, noticeSettingKey, ONLINE_NOTICE_DEFAULTS, ONLINE_NOTICE_KINDS, ONLINE_NOTICE_SETTING_KEYS,
};
export type { OnlineNoticeKind, OnlineNoticeSettingKey, OnlineNoticeSettings };
