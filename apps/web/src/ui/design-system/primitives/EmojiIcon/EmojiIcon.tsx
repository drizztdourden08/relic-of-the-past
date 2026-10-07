/* @layer renderer-components @kind component */
import './EmojiIcon.css';
import type { EmojiIconProps } from './EmojiIcon.type';

/** Colour emoji glyph. Decorative by default, so the control that wraps it carries the accessible name. */
const EmojiIcon = (props: EmojiIconProps) => {
  const { glyph, size = 'md', className = '', ...rest } = props;
  return (
    <span
      className={`emoji-icon emoji-icon--${size}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      {...rest}
    >
      {glyph}
    </span>
  );
};

export { EmojiIcon };
