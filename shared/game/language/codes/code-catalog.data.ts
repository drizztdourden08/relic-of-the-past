/* @layer shared-game @kind data */
/**
 * Raw catalog: one entry per control code the game's languages can emit,
 * verified against the decompiled engine. Covers every name in every
 * language's `commandNames` (see `shared/asset-extraction/text/data/language-data.ts`).
 *
 * `EndMessage` (EU-only) has no documented behavior of its own here: it is
 * absent from `kCmdInfo` in `dialogue-encoder.ts`, which is consistent with
 * it being an automatic message terminator instead of something a
 * translator places by hand. It is catalogued as `structural` on that
 * basis, not from a confirmed engine fact.
 */
import type { CodeInfo } from './code-catalog.types';

const CODE_CATALOG: CodeInfo[] = [
  { name: '1', label: 'Line 1', description: 'start writing at the left of line 1 of the box', risk: 'safe', scope: 'positional', offerInMenu: true },
  { name: '2', label: 'Line 2', description: 'start writing at the left of line 2 of the box', risk: 'safe', scope: 'positional', offerInMenu: true },
  { name: '3', label: 'Line 3', description: 'start writing at the left of line 3 of the box', risk: 'safe', scope: 'positional', offerInMenu: true },
  { name: 'Waitkey', label: 'Wait for button', description: 'stop until the player presses A or B, then continue', risk: 'safe', scope: 'positional', offerInMenu: true },
  { name: 'Scroll', label: 'Scroll up one line', description: 'slide the box up one line, continue on the bottom line', risk: 'safe', scope: 'positional', offerInMenu: true },
  { name: 'Name', label: "Player's name", description: "inserts the player's file name, 1-6 characters", risk: 'safe', scope: 'message', offerInMenu: true },
  { name: 'Speed', label: 'Text speed', description: 'frames of delay per character; 0 shows the whole message at once', risk: 'safe', scope: 'positional', param: { min: 0, max: 15 }, offerInMenu: true },
  { name: 'Wait', label: 'Pause', description: 'wait roughly 0.5s to 8s with no button press', risk: 'safe', scope: 'positional', param: { min: 0, max: 15 }, offerInMenu: true },
  { name: 'Color', label: 'Text colour', description: 'which palette the whole message uses', risk: 'safe', scope: 'message', param: { min: 0, max: 15 }, offerInMenu: true },
  { name: 'Number', label: 'Number digit', description: 'inserts ONE digit of a runtime number; a two-digit value needs two of these, high digit first', risk: 'safe', scope: 'message', param: { min: 0, max: 3 }, offerInMenu: true },
  { name: 'Window', label: 'No box frame', description: 'draw the text without the box border', risk: 'safe', scope: 'positional', param: { min: 0, max: 2 }, offerInMenu: true },
  { name: 'Position', label: 'Box position', description: 'force the box to the upper or lower slot instead of automatic', risk: 'safe', scope: 'positional', param: { min: 0, max: 1 }, offerInMenu: true },
  { name: 'Choose', label: 'Two-option prompt', description: 'shows a selection cursor; option text lives in this entry, one option per line', risk: 'structural', scope: 'positional', offerInMenu: true },
  { name: 'Choose2', label: 'Two-option prompt (variant)', description: 'shows a selection cursor; option text lives in this entry, one option per line', risk: 'structural', scope: 'positional', offerInMenu: true },
  { name: 'Choose3', label: 'Three-option prompt', description: 'shows a selection cursor; option text lives in this entry, one option per line', risk: 'structural', scope: 'positional', offerInMenu: true },
  { name: 'Selchg', label: 'Two-option prompt (indented cursor)', description: 'shows a selection cursor; option text lives in this entry, one option per line', risk: 'structural', scope: 'positional', offerInMenu: true },
  { name: 'Item', label: 'Item picker', description: 'the player cycles their own items; the icon is drawn into the box', risk: 'structural', scope: 'positional', offerInMenu: true },
  { name: 'ScrollSpd', label: 'Scroll speed', description: 'how fast a scroll animates', risk: 'safe', scope: 'positional', offerInMenu: true },
  { name: 'Sound', label: 'Play a sound', description: 'plays a sound effect', risk: 'safe', scope: 'positional', offerInMenu: true },
  { name: 'NextPic', label: 'Story-scene wait', description: 'only meaningful in the opening story sequence', risk: 'safe', scope: 'positional', offerInMenu: true },
  { name: 'Unused_Crash', label: 'Unused slot', description: 'DANGEROUS: has no handler and hangs the game', risk: 'dangerous', scope: 'positional', offerInMenu: false },
  { name: 'Unused_Mark', label: 'Unused slot', description: 'DANGEROUS: crashes on an assert', risk: 'dangerous', scope: 'positional', offerInMenu: false },
  { name: 'Unused_Mark2', label: 'Unused slot', description: 'DANGEROUS: crashes on an assert', risk: 'dangerous', scope: 'positional', offerInMenu: false },
  { name: 'Unused_Clear', label: 'Unused slot', description: 'DANGEROUS: crashes on an assert', risk: 'dangerous', scope: 'positional', offerInMenu: false },
  { name: 'Mark', label: 'Unused slot', description: 'DANGEROUS: crashes on an assert', risk: 'dangerous', scope: 'positional', offerInMenu: false },
  { name: 'Mark2', label: 'Unused slot', description: 'DANGEROUS: crashes on an assert', risk: 'dangerous', scope: 'positional', offerInMenu: false },
  { name: 'Clear', label: 'Unused slot', description: 'DANGEROUS: crashes on an assert', risk: 'dangerous', scope: 'positional', offerInMenu: false },
  { name: 'EndMessage', label: 'Message terminator', description: 'marks the end of a message; inserted automatically when the message is compiled, never place it by hand', risk: 'structural', scope: 'positional', offerInMenu: false },
];

export { CODE_CATALOG };
