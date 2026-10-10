/* @layer renderer-components @kind component */
import { useEffect, useState } from 'react';
import { Portal } from '@drizztdourden08/tessera/primitives';
import { ghostPosition } from '@app/hud-layout-editing/drop-ghost';
import { GhostCard } from './sub-components/GhostCard';
import type { DragGhostProps } from './DragGhost.type';

const DragGhost = (props: DragGhostProps) => {
  const { model } = props;
  const active = model !== null;
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!active) { setAt(null); return undefined; }
    const onMove = (event: PointerEvent): void => setAt({ x: event.clientX, y: event.clientY });
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [active]);

  if (!model || !at) return null;
  const place = ghostPosition(at, { w: window.innerWidth, h: window.innerHeight });

  return (
    <Portal layer="tooltip">
      <GhostCard model={model} style={place} />
    </Portal>
  );
};

export { DragGhost };
