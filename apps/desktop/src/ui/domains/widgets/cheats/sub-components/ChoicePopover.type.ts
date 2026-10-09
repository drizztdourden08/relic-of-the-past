/* @layer renderer-widgets @kind types */
type ChoiceTone = 'give' | 'set' | 'remove' | 'plain';

type ChoiceOption = {
  key: string;
  label: string;
  sprite?: string | null;
  current?: boolean;
  tone?: ChoiceTone;
  hint?: string;
  onPick: () => void;
  onPickAll?: () => void;
  allHint?: string;
};

type ChoicePopoverProps = {
  title: string;
  options: ChoiceOption[];
  anchor: HTMLElement | null;
  onClose: () => void;
  allLabel?: string;
};

export type { ChoiceOption, ChoicePopoverProps, ChoiceTone };
