/* @layer renderer-components @kind component */
/**
 * The pin on a widget's own window: a click steps through off, always on top,
 * with the app. Lit while the window is on top right now, whichever mode put
 * it there.
 */
import { useCallback } from 'react';
import type { PinMode } from '@shared/types/widget-layout';
import { Button } from '../../../primitives/Button';

interface PinButtonProps {
  pin: PinMode;
  onTop: boolean;
  onChange: (mode: PinMode) => void;
}

const NEXT: Record<PinMode, PinMode> = { off: 'top', top: 'with-app', 'with-app': 'off' };
const TITLE: Record<PinMode, string> = {
  off: 'Pin: off. Click for always on top.',
  top: 'Pin: always on top. Click to follow the app.',
  'with-app': 'Pin: with the app. Click to unpin.',
};
const GLYPH: Record<PinMode, string> = { off: '○', top: '●', 'with-app': '◉' };

const PinButton = (props: PinButtonProps) => {
  const { pin, onTop, onChange } = props;
  const handleClick = useCallback(() => onChange(NEXT[pin]), [onChange, pin]);
  return (
    <Button variant="bare" className="widget__btn" active={onTop} onClick={handleClick} title={TITLE[pin]}>
      {GLYPH[pin]}
    </Button>
  );
};

export { PinButton };
export type { PinButtonProps };
