/* @layer renderer-components @kind component */
import type { KeyboardEvent } from 'react';
import { Pressable, Text, EmojiIcon } from '@drizztdourden08/tessera/primitives';
import './ArmedActionButton.css';
import { ARMED_GLYPHS } from './ArmedActionButton.constants';
import type { ArmedActionButtonProps } from './ArmedActionButton.type';

const ArmedActionButton = (props: ArmedActionButtonProps) => {
  const { action, label, caption, shortcutHint, disabled, disabledReason, armed, tabIndex, onPress, onDisarm } = props;

  const armedLabel = `${label}: armed, click again to confirm`;
  const idleTitle = shortcutHint ? `${label} (${shortcutHint})` : label;
  const title = disabled && disabledReason ? disabledReason : idleTitle;
  const className = [
    'armed-action',
    `armed-action--${action}`,
    caption ? 'armed-action--captioned' : '',
    armed ? 'armed-action--armed' : '',
  ].filter(Boolean).join(' ');

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') onDisarm();
  };

  return (
    <Pressable
      className={className}
      onClick={onPress}
      onBlur={onDisarm}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      tabIndex={tabIndex}
      title={armed ? armedLabel : title}
      aria-label={armed ? armedLabel : label}
      aria-pressed={armed}
    >
      <Text className="armed-action__glyph">
        <EmojiIcon glyph={ARMED_GLYPHS[action]} size="lg" className="armed-action__emoji" />
      </Text>
      {caption && <Text className="armed-action__caption">{armed ? `${caption}?` : caption}</Text>}
    </Pressable>
  );
};

export { ArmedActionButton };
