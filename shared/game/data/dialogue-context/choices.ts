/* @layer shared-game @kind data */
/**
 * Where a choice prompt's options lead.
 *
 * The arithmetic inside the prompt renderer (`dialogue_message_index = t + 1`
 * and friends, messaging.c:2648/2720/2742/2762) does NOT pick an outcome — it
 * swaps in a cursor-overlay entry so the caret can be redrawn in place. The
 * real outcome is decided by the caller, which reads the selection back out of
 * `choice_in_multiselect_box` and opens a message of its own; those branches
 * are what this table records.
 *
 * `outcomes` is sparse and may repeat an option: an option whose branch opens
 * no message is simply absent, and an option that opens different messages
 * depending on game state gets one row per branch, each with its `when`.
 */
import type { DialogueChoiceRecord } from './types';

const dialogueChoices: DialogueChoiceRecord[] = [
  { id: 25, options: 2, source: 'sprite_main.c:5629', outcomes: [{ option: 1, entry: 25 }] },
  { id: 38, options: 2, source: 'sprite_main.c:6294', outcomes: [{ option: 0, entry: 37 }, { option: 1, entry: 38 }] },
  { id: 45, options: 2, source: 'sprite_main.c:11194', outcomes: [{ option: 0, entry: 46 }, { option: 1, entry: 45 }] },
  { id: 134, options: 2, source: 'sprite_main.c:1813', outcomes: [{ option: 0, entry: 135, when: 'holding at least 20 rupees' }, { option: 1, entry: 136 }] },
  { id: 137, options: 2, source: 'sprite_main.c:1813', outcomes: [{ option: 0, entry: 135, when: 'holding at least 20 rupees' }, { option: 1, entry: 136 }] },
  { id: 138, options: 2, source: 'sprite_main.c:11418', outcomes: [{ option: 0, entry: 335 }, { option: 1, entry: 333 }] },
  { id: 140, options: 2, source: 'sprite_main.c:1204', outcomes: [{ option: 1, entry: 142 }] },
  { id: 142, options: 2, source: 'sprite_main.c:1284', outcomes: [{ option: 0, entry: 143 }] },
  { id: 150, options: 2, source: 'sprite_main.c:11496', outcomes: [
      { option: 0, entry: 151 },
      { option: 0, entry: 153, when: 'capacity already at its maximum' },
      { option: 1, entry: 152 },
      { option: 1, entry: 153, when: 'capacity already at its maximum' },
    ] },
  { id: 201, options: 2, source: 'sprite_main.c:1431', outcomes: [{ option: 0, entry: 203, when: 'no free container' }] },
  { id: 202, options: 2, source: 'sprite_main.c:11854', outcomes: [{ option: 0, entry: 203, when: 'no free container' }] },
  { id: 210, options: 2, source: 'sprite_main.c:6186', outcomes: [{ option: 0, entry: 211, when: 'holding at least 100 rupees' }, { option: 1, entry: 212 }] },
  { id: 217, options: 2, source: 'sprite_main.c:10150', outcomes: [{ option: 0, entry: 218 }, { option: 1, entry: 221 }] },
  { id: 218, options: 2, source: 'sprite_main.c:10159', outcomes: [
      { option: 0, entry: 219 },
      { option: 0, entry: 220, when: 'weapon already at its final tier' },
      { option: 1, entry: 221 },
    ] },
  { id: 219, options: 2, source: 'sprite_main.c:10173', outcomes: [{ option: 0, entry: 222, when: 'holding at least 10 rupees' }, { option: 1, entry: 221 }] },
  { id: 230, options: 2, source: 'sprite_main.c:9934', outcomes: [{ option: 0, entry: 231 }, { option: 1, entry: 232 }] },
  { id: 244, options: 2, source: 'sprite_main.c:1045', outcomes: [{ option: 1, entry: 246 }] },
  { id: 255, options: 2, source: 'sprite_main.c:9730', outcomes: [{ option: 1, entry: 257 }] },
  { id: 266, options: 2, source: 'sprite_main.c:10664', outcomes: [{ option: 0, entry: 269, when: 'the carried object was put down' }, { option: 1, entry: 267 }] },
  { id: 284, options: 2, source: 'sprite_main.c:24480', outcomes: [{ option: 0, entry: 286, when: 'holding at least 100 rupees' }, { option: 1, entry: 285 }] },
  { id: 287, options: 2, source: 'sprite_main.c:24426', outcomes: [{ option: 0, entry: 288, when: 'holding at least 10 rupees' }, { option: 1, entry: 289 }] },
  { id: 315, options: 2, source: 'sprite_main.c:23347', outcomes: [{ option: 0, entry: 314 }] },
  { id: 323, options: 2, source: 'sprite_main.c:3016', outcomes: [{ option: 0, entry: 324 }, { option: 1, entry: 327 }] },
  { id: 324, options: 2, source: 'sprite_main.c:3025', outcomes: [{ option: 0, entry: 325, when: 'holding at least 500 rupees' }, { option: 1, entry: 326 }] },
  { id: 331, options: 2, source: 'sprite_main.c:1149', outcomes: [{ option: 0, entry: 139 }, { option: 1, entry: 332 }] },
  { id: 335, options: 2, source: 'sprite_main.c:11433', outcomes: [{ option: 0, entry: 333, when: 'the chosen amount cannot be paid' }, { option: 1, entry: 333, when: 'the chosen amount cannot be paid' }] },
  { id: 353, options: 2, source: 'sprite_main.c:25052', outcomes: [{ option: 0, entry: 357, when: 'holding at least 30 rupees' }, { option: 1, entry: 354 }] },
  { id: 383, options: 2, source: 'sprite_main.c:25118', outcomes: [{ option: 0, entry: 384, when: 'holding at least 20 rupees' }, { option: 1, entry: 385 }] },
  { id: 386, options: 2, source: 'sprite_main.c:25145', outcomes: [{ option: 0, entry: 384, when: 'holding at least 100 rupees' }, { option: 1, entry: 385 }] },
  { id: 392, options: 2, source: 'sprite_main.c:19198', outcomes: [{ option: 0, entry: 393, when: 'holding at least 80 rupees' }, { option: 1, entry: 394 }] },
];

export { dialogueChoices };
