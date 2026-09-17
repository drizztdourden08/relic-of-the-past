/* @layer renderer-widgets @kind component */
/**
 * Owns the pointer hint of one tab: the state the controls set and the box that draws it,
 * portalled beside the pointer in viewport coordinates and kept inside the window.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { Box, Portal, Text } from '@ds/primitives';
import { ControlGlyph } from './ControlGlyph';
import { PointerHintContext } from '../behavior/pointer-hint-context';
import type { PointerHintApi, PointerHintState } from '../behavior/pointer-hint-context';
import type { ControlHint } from './ControlGlyph.type';

/** How far from the pointer the box sits, so the cursor never covers it. */
const OFFSET = 14;
const EDGE = 6;

type PointerHintProviderProps = {
  children: ReactNode;
};

const PointerHintProvider = ({ children }: PointerHintProviderProps) => {
  const [state, setState] = useState<PointerHintState | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const place = useCallback((e: MouseEvent): { x: number; y: number } => {
    const w = boxRef.current?.offsetWidth ?? 0;
    const h = boxRef.current?.offsetHeight ?? 0;
    let x = e.clientX + OFFSET;
    let y = e.clientY + OFFSET;
    if (x + w > window.innerWidth - EDGE) x = Math.max(EDGE, e.clientX - w - OFFSET);
    if (y + h > window.innerHeight - EDGE) y = Math.max(EDGE, e.clientY - h - OFFSET);
    return { x, y };
  }, []);

  const api = useMemo<PointerHintApi>(() => ({
    show: (title: string, items: readonly ControlHint[], e: MouseEvent) => setState({ title, items, ...place(e) }),
    move: (e: MouseEvent) => setState((prev) => (prev ? { ...prev, ...place(e) } : prev)),
    hide: () => setState(null),
  }), [place]);

  return (
    <PointerHintContext.Provider value={api}>
      {children}
      {state && (
        <Portal layer="tooltip">
          <Box ref={boxRef} className="cheats-pointer-hint" style={{ left: state.x, top: state.y }} aria-hidden="true">
            <Text className="cheats-pointer-hint__title">{state.title}</Text>
            {state.items.map((item) => (
              <Box key={`${item.glyph}-${item.label}`} className="cheats-pointer-hint__row">
                <ControlGlyph kind={item.glyph} keyName={item.keyName} />
                <Text className="cheats-pointer-hint__label">{item.label}</Text>
              </Box>
            ))}
          </Box>
        </Portal>
      )}
    </PointerHintContext.Provider>
  );
};

export { PointerHintProvider };
export type { PointerHintProviderProps };
