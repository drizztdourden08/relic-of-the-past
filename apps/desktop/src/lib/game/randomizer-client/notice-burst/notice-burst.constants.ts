/* @layer bridge-wasm @kind constants */
import type { OnlineNoticeKind } from '@shared/randomizer/archipelago/online-notice-settings';

const BURST_LIMIT = 3;
const BURST_WINDOW_MS = 2000;
const MAX_VISIBLE = 5;

const SUMMARY_TEXT: Readonly<Record<OnlineNoticeKind, [string, string]>> = {
  itemReceived: [' items received from ', ' items received'],
  itemSent: [' items sent to ', ' items sent'],
  ownCheck: [' of your items found', ' of your items found'],
  otherCheck: [' items found by other players', ' items found by other players'],
  hintOwn: [' hints', ' hints'],
  hintOther: [' hints', ' hints'],
  connection: [' connection changes', ' connection changes'],
  join: [' players joined or left', ' players joined or left'],
  goal: [' goals completed', ' goals completed'],
  release: [' releases and collects', ' releases and collects'],
  deathLink: [' deaths', ' deaths'],
  chat: [' chat messages', ' chat messages'],
};

export { BURST_LIMIT, BURST_WINDOW_MS, MAX_VISIBLE, SUMMARY_TEXT };
