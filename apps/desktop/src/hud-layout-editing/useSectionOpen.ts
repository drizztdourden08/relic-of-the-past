/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { MAX_OPEN } from './inspector-sections/inspector-sections.constants';
import type { HudNode } from '@rotp/hud';
import type { InspectorSectionKey } from '@app/views/HudLayoutEditor/sub-components/NodeInspector.type';

const useSectionOpen = (node: HudNode | null) => {
  const [open, setOpen] = useState<InspectorSectionKey[]>(['identity', 'content']);

  useEffect(() => {
    setOpen(node?.kind === 'container' ? ['identity', 'layout'] : ['identity', 'content']);
  }, [node?.id]);

  const toggle = (key: InspectorSectionKey): void => setOpen((prev) => {
    if (prev.includes(key)) return prev.filter((k) => k !== key);
    const next = [...prev, key];
    return next.length > MAX_OPEN ? next.slice(next.length - MAX_OPEN) : next;
  });

  return { isOpen: (key: InspectorSectionKey): boolean => open.includes(key), toggle };
};

export { useSectionOpen };
