/* @layer renderer-components @kind component */
/**
 * One small mouse with the relevant part LIT. It is the picture half of a legend,
 * beside `KeyCap`'s keyboard half.
 *
 * WHY A DRAWING INSTEAD OF THE WORD "click". A legend's job is to be read
 * without being read: a strip of four entries is scanned, not parsed, and a
 * body with its left ear filled says "press this button" before any word does.
 * Lucide has no mouse-with-one-button-lit, and an icon that lights the wrong
 * half would be worse than none. So the four parts are drawn here, in the
 * primitive, the same way `Icon` keeps its raw paths.
 *
 * ONE BODY, FOUR HIGHLIGHTS. The outline never changes between variants, which
 * is what lets `[left] select · [drag] rectangle` read as two states of one
 * object instead of two unrelated pictures.
 */
import './MouseGlyph.css';
import type { MouseGlyphProps, MousePart } from './MouseGlyph.type';

const SPOKEN: Record<MousePart, string> = {
  left: 'left click',
  right: 'right click',
  wheel: 'scroll wheel',
  drag: 'drag',
};

/** The two ear shapes, in the 16x16 box the body is drawn in. */
const LEFT_EAR = 'M3.2 5.2a4.8 4.8 0 0 1 4.3-3.1V7H3.2z';
const RIGHT_EAR = 'M12.8 5.2a4.8 4.8 0 0 0-4.3-3.1V7h4.3z';

const MouseGlyph = (props: MouseGlyphProps) => {
  const { part, size = 16, title, className = '', ...rest } = props;
  const label = title ?? SPOKEN[part];
  return (
    <svg
      className={`mouse-glyph mouse-glyph--${part}${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      role="img"
      aria-label={label}
      {...rest}
    >
      <title>{label}</title>
      <rect
        className="mouse-glyph__body"
        x="3.2" y="1.6" width="9.6" height="12.8" rx="4.8"
        fill="none" stroke="currentColor" strokeWidth="1.2"
      />
      {/* A drag is the left button HELD, so it lights the same ear and adds the
          travel. The alternative, a bare body with trails, would read as
          "move the mouse" instead of "press and move". */}
      {(part === 'left' || part === 'drag') && <path className="mouse-glyph__lit" d={LEFT_EAR} fill="currentColor" />}
      {part === 'right' && <path className="mouse-glyph__lit" d={RIGHT_EAR} fill="currentColor" />}
      {part === 'wheel' && (
        <rect className="mouse-glyph__lit" x="7.2" y="3.6" width="1.6" height="3.6" rx="0.8" fill="currentColor" />
      )}
      {part === 'drag' && (
        <path
          className="mouse-glyph__lit"
          d="M0.6 13.4h2.2M13.2 13.4h2.2"
          fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
        />
      )}
    </svg>
  );
};

export { MouseGlyph };
