/* @layer renderer-components @kind component */
/**
 * One collapsible section of the inspector. Nine of these are what let a
 * panel that has grown from six properties to thirty stay scannable at 232px
 * (`plans/hud-data-binding.html`, "The property panel").
 *
 * THE HEADER CARRIES A BOUND-COUNT BADGE (`● n`) so a section that is doing
 * something can be told apart from one that is not WITHOUT opening it. The
 * whole reason nine sections fit in this width is that most stay closed most
 * of the time. Empty when nothing on this node is bound to data; never shown
 * as `● 0`.
 *
 * OPEN STATE IS THE PARENT'S, not this component's own. `NodeInspector` is
 * what enforces "only two or three open at once" by closing the oldest
 * section when a new one opens, which only works if one place owns the set.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import type { ReactNode } from 'react';

interface SectionAccordionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  /** The bound-value count, when this section has any. Renders as `● n`. */
  boundCount?: number;
  /** A short note beside the title, e.g. "of the selected child". */
  note?: string;
  children: ReactNode;
}

const SectionAccordion = (props: SectionAccordionProps) => {
  const { title, open, onToggle, boundCount, note, children } = props;

  return (
    <Box className={`hud-section${open ? ' is-open' : ''}`}>
      <Button
        variant="bare"
        className="hud-section__head"
        aria-expanded={open}
        onClick={onToggle}
      >
        <Text className="hud-section__caret" aria-hidden>{open ? '▾' : '▸'}</Text>
        <Text className="hud-section__title">{title}</Text>
        {note && <Text className="hud-section__note">{note}</Text>}
        {!!boundCount && <Text className="hud-section__badge" title={`${boundCount} bound propert${boundCount === 1 ? 'y' : 'ies'}`}>● {boundCount}</Text>}
      </Button>
      {open && <Box className="hud-section__body">{children}</Box>}
    </Box>
  );
};

export { SectionAccordion };
export type { SectionAccordionProps };
