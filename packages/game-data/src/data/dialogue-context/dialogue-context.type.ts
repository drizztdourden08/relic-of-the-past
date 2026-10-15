/* @layer shared-game @kind types */
type DialogueTrigger =
  | 'talk'
  | 'sign'
  | 'telepathy'
  | 'item-get'
  | 'menu'
  | 'cutscene'
  | 'system'
  | 'choice-cursor'
  | 'unknown';

type ChoiceOutcome = {
  option: number;
  entry: number;
  when?: string;
};

type DialogueChoice = {
  options: number;
  outcomes: ChoiceOutcome[];
};

type DialogueContext = {
  id: number;
  trigger: DialogueTrigger;
  source?: string;
  choice?: DialogueChoice;
};

type ContextTableGroup = {
  trigger: DialogueTrigger;
  source: string;
  ids: number[];
};

type ContextSiteGroup = {
  file: string;
  trigger: DialogueTrigger;
  sites: [number, number][];
};

type DialogueChoiceRecord = {
  id: number;
  options: number;
  source: string;
  outcomes: ChoiceOutcome[];
};

type TriggerSource =
  | { by: 'actor'; spriteType: number; alsoTypes?: number[]; actorId: string | null }
  | { by: 'follower'; followerId: number }
  | { by: 'place'; areaId: number }
  | { by: 'room'; roomId: number }
  | { by: 'item'; itemId: number }
  | { by: 'engine'; site: string }
  | { by: 'cursor-frame' };

type TriggerSourceRow = TriggerSource & {
  id: number;
  source: string;
};

export type {
  DialogueTrigger,
  DialogueChoice,
  DialogueContext,
  ContextTableGroup,
  ContextSiteGroup,
  DialogueChoiceRecord,
  TriggerSourceRow,
};
