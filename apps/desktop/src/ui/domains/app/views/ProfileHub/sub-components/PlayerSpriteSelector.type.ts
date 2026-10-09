/* @layer renderer-components @kind types */
interface PlayerSpriteSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

interface SpriteChoice {
  name: string | null;
  label: string;
  preview: string | null;
}

interface SpriteChoiceCardProps {
  choice: SpriteChoice;
  selected: boolean;
  onChange: (value: string | null) => void;
}

export type { PlayerSpriteSelectorProps, SpriteChoice, SpriteChoiceCardProps };
