/* @layer shared-game @kind constants */
const ONLINE_NOTICE_KINDS = [
  'itemReceived', 'itemSent', 'ownCheck', 'otherCheck', 'hintOwn', 'hintOther',
  'connection', 'join', 'goal', 'release', 'deathLink', 'chat',
] as const;

export { ONLINE_NOTICE_KINDS };
