/* @layer shared-game @kind types */
/**
 * Shapes for the dialogue-context dataset: what triggers a given entry, and
 * where a choice prompt's options lead.
 */

/**
 * How an entry reaches the screen.
 *
 * - `talk`          a character opens it, on contact or when spoken to
 * - `sign`          read from a placed marker
 * - `telepathy`     remote speech, from standing on a floor marker
 * - `item-get`      shown while a fresh pickup is held overhead
 * - `menu`          part of a menu the player operates
 * - `cutscene`      played by a scripted sequence
 * - `system`        opened by the engine in response to a game rule
 * - `choice-cursor` NOT prose: a caret-only overlay the prompt renderer swaps
 *                   in to redraw the selection marker. Never shown on its own,
 *                   and its layout must survive translation untouched.
 * - `unknown`       no evidence found; deliberately unlabeled
 */
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

/** One proven option -> follow-up entry link inside a choice prompt. */
type ChoiceOutcome = {
  /** 0-based option index, counted top to bottom as the caret moves. */
  option: number;
  /** Entry id opened when this option is taken. */
  entry: number;
  /** Extra condition the branch also requires, if any. */
  when?: string;
};

/** The choice side of an entry that asks the player to pick. */
type DialogueChoice = {
  /** How many options the prompt offers. */
  options: number;
  /**
   * Proven links only, so the list is sparse: an option whose branch opens no
   * message is absent, and an option that opens different messages depending
   * on game state appears once per branch.
   */
  outcomes: ChoiceOutcome[];
};

/** What one dialogue entry is. */
type DialogueContext = {
  /** Entry index, 1..397 (see ./context.ts for the convention). */
  id: number;
  trigger: DialogueTrigger;
  /** Where the evidence came from, e.g. 'messaging.c:2742'. */
  source?: string;
  choice?: DialogueChoice;
};

/** Entries that share one piece of evidence because they come from a table. */
type ContextTableGroup = {
  trigger: DialogueTrigger;
  source: string;
  ids: number[];
};

/** Entries pinned to individual lines of one game-core file. */
type ContextSiteGroup = {
  file: string;
  trigger: DialogueTrigger;
  /** [entry id, line number] pairs. */
  sites: [number, number][];
};

/** One row of the choice table, before it is folded into a DialogueContext. */
type DialogueChoiceRecord = {
  id: number;
  options: number;
  source: string;
  outcomes: ChoiceOutcome[];
};

export type {
  DialogueTrigger,
  ChoiceOutcome,
  DialogueChoice,
  DialogueContext,
  ContextTableGroup,
  ContextSiteGroup,
  DialogueChoiceRecord,
};
