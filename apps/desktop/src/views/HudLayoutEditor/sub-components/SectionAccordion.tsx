/* @layer renderer-components @kind component */
import { Box, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import type { SectionAccordionProps } from './SectionAccordion.type';

const SectionAccordion = (props: SectionAccordionProps) => {
  const { title, open, onToggle, boundCount, note, children } = props;

  return (
    <Box className={`hud-section${open ? ' is-open' : ''}`}>
      <Pressable
        className="hud-section__head"
        aria-expanded={open}
        onClick={onToggle}
      >
        <Text className="hud-section__caret" aria-hidden>{open ? '▾' : '▸'}</Text>
        <Text className="hud-section__title">{title}</Text>
        {note && <Text className="hud-section__note">{note}</Text>}
        {Boolean(boundCount) && <Text className="hud-section__badge" title={`${boundCount} bound propert${boundCount === 1 ? 'y' : 'ies'}`}>● {boundCount}</Text>}
      </Pressable>
      {open && <Box className="hud-section__body">{children}</Box>}
    </Box>
  );
};

export { SectionAccordion };
