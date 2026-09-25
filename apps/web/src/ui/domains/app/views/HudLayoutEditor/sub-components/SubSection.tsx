/* @layer renderer-components @kind component */
/**
 * A SECTION IS A TITLE, A GOLD UNDERLINE, AND THE STUFF UNDER IT. That is
 * the whole of §55's answer to the maintainer:
 *
 * > "why do we have container inception exactly?? and why the black background?
 * > [...] i asked for its own section, that means a title, an underline in gold
 * > and the stuff under it, then another section like that with the grid
 * > component ONLY. stop putting container with border everywhere, that's
 * > horrible."
 *
 * SO THERE IS NO BOX HERE. No border, no `--c-sunken` well, no radius, no
 * padding of its own beyond the title's. The content sits on the panel's own
 * background. §54 drew three nested surfaces to make the settings and the
 * toolbar "clearly different kinds of thing": the accordion's body, then
 * `GridEditor`'s bordered block, then `GridSettings`' sunken panel inside that.
 * Three frames around one list of fields is the inception, and a rule is what a
 * heading needed all along.
 *
 * IT IS THE ACCORDION'S OWN IDIOM, ONE STEP QUIETER. `.hud-section__head` is an
 * uppercase gold title over a 2px `--c-gold` rule; this is the same title in
 * `--c-gold` instead of `--c-gold-bright`, over a 1px rule, with no inset
 * background behind it, so a sub-section reads as belonging to the section it
 * is in and not competing with it.
 */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import './HudLayoutEditor.layout.css';
import type { ReactNode } from 'react';

interface SubSectionProps {
  /** Printed uppercase by the sheet, so pass it in sentence case. */
  title: string;
  children: ReactNode;
}

const SubSection = (props: SubSectionProps) => {
  const { title, children } = props;
  return (
    <Box className="hud-subsec" role="group" aria-label={title}>
      <Text className="hud-subsec__title">{title}</Text>
      <Box className="hud-subsec__body">{children}</Box>
    </Box>
  );
};

export { SubSection };
export type { SubSectionProps };
