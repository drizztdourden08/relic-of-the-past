/* @layer renderer-components @kind component */
/**
 * One keyboard key, DRAWN AS A CAP. That is a raised rectangle with the key's own
 * legend on it, not the key's name wrapped in brackets.
 *
 * A LEGEND THAT SPELLS `Ctrl+click` IN PROSE IS READ AS PROSE. The eye skips it
 * along with the rest of the sentence; a cap is a picture of the thing on the
 * desk, and it is found at a glance in a strip of six. That is the whole reason
 * this exists as a primitive instead of a span with a border: every legend in
 * the app draws the same cap, so `Esc` looks the same wherever it is promised.
 *
 * IT OWNS NO STORE AND KNOWS NO PLATFORM. `Ctrl` versus `⌘` is
 * `primaryModifierLabel(os)`'s answer and arrives as the `label` prop, so a cap
 * can never disagree with the key that actually works.
 */
import './KeyCap.css';
import type { KeyCapProps } from './KeyCap.type';

const KeyCap = (props: KeyCapProps) => {
  const { label, size = 'sm', title, className = '', ...rest } = props;
  return (
    <kbd
      className={`keycap keycap--${size}${className ? ` ${className}` : ''}`}
      title={title ?? label}
      {...rest}
    >
      {label}
    </kbd>
  );
};

export { KeyCap };
