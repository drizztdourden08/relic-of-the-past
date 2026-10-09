/* @layer renderer-components @kind constants */
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { Block } from '@shared/game/language';
import type { DialogueTrigger } from '@rotp/game-data';
import type { EntryViewMode } from '../../behavior/language-behavior.type';
import type { FitChip, TriggerFacts } from './entry.type';

const BLOCK_END_WORDS: Record<Block['ends'], string> = {
  wait: 'wait',
  'message-end': 'message end',
};

const EXCERPT_LIMIT = 96;

const TRIGGER_WORDS: Record<DialogueTrigger, string> = {
  talk: 'talk',
  sign: 'sign',
  telepathy: 'telepathy',
  'item-get': 'item get',
  menu: 'menu',
  cutscene: 'cutscene',
  system: 'system',
  'choice-cursor': 'cursor overlay',
  unknown: '',
};

const NAME_CODE = 'Name';
const NUMBER_CODE = 'Number';
const WAIT_BUTTON_CODE = 'Waitkey';
const PAUSE_CODE = 'Wait';

const NEAR_LIMIT_RATIO = 0.9;

const NOT_MEASURED: FitChip = { label: '', variant: 'success', detail: '' };

const NO_FACTS: TriggerFacts = {
  by: null, who: '', where: '', nativeKey: '', alsoNames: [], citation: '',
};

const VIEW_MODE_OPTIONS: SegmentOption<EntryViewMode>[] = [
  { value: 'read', label: 'Read' },
  { value: 'edit', label: 'Edit' },
  { value: 'preview', label: 'Preview' },
];

export {
  BLOCK_END_WORDS, EXCERPT_LIMIT, NAME_CODE, NEAR_LIMIT_RATIO, NO_FACTS, NOT_MEASURED, NUMBER_CODE, PAUSE_CODE, TRIGGER_WORDS, VIEW_MODE_OPTIONS,
  WAIT_BUTTON_CODE,
};
