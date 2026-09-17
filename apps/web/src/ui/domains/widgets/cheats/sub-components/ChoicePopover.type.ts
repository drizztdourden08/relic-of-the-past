/* @layer renderer-widgets @kind types */

/** How a row reads: a give plays the receipt, a set writes the byte, a remove takes it away. */
type ChoiceTone = 'give' | 'set' | 'remove' | 'plain';

type ChoiceOption = {
  key: string;
  label: string;
  /** Full sprite URL; a row with none draws an empty box in the sprite's place. */
  sprite?: string | null;
  current?: boolean;
  tone?: ChoiceTone;
  /** Tooltip on the row, for a detail the label leaves out (a receive id, a refusal). */
  hint?: string;
  onPick: () => void;
  /** Present when the same choice can be applied to every slot of the rack at once. */
  onPickAll?: () => void;
  allHint?: string;
};

type ChoicePopoverProps = {
  title: string;
  options: ChoiceOption[];
  /** The element the list opens under; null draws nothing. */
  anchor: HTMLElement | null;
  onClose: () => void;
  /** Text of the per-row "all" control, shown only on rows that carry onPickAll. */
  allLabel?: string;
};

export type { ChoiceOption, ChoicePopoverProps, ChoiceTone };
