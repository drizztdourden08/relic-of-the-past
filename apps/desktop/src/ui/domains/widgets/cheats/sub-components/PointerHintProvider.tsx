/* @layer renderer-widgets @kind component */
import { useCallback, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Box, Portal, Shortcut, Text } from '@drizztdourden08/tessera/primitives';
import { PointerHintContext } from '../behavior/pointer-hint-context';
import { shortcutOf } from '../behavior/shortcut-of';
import type { PointerHintApi, PointerHintState } from '../CheatsWidget.type';
import type { ControlHint } from './ControlHint.type';
import { POINTER_OFFSET, VIEWPORT_EDGE } from './PointerHintProvider.constants';
import type { PointerHintProviderProps } from './PointerHintProvider.type';

const PointerHintProvider = ({ children }: PointerHintProviderProps) => {
  const [state, setState] = useState<PointerHintState | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const place = useCallback((e: MouseEvent): { x: number; y: number } => {
    const w = boxRef.current?.offsetWidth ?? 0;
    const h = boxRef.current?.offsetHeight ?? 0;
    let x = e.clientX + POINTER_OFFSET;
    let y = e.clientY + POINTER_OFFSET;
    if (x + w > window.innerWidth - VIEWPORT_EDGE) x = Math.max(VIEWPORT_EDGE, e.clientX - w - POINTER_OFFSET);
    if (y + h > window.innerHeight - VIEWPORT_EDGE) y = Math.max(VIEWPORT_EDGE, e.clientY - h - POINTER_OFFSET);
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
                <Shortcut size="xs" {...shortcutOf(item)} />
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
