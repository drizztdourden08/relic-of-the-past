/* @layer renderer-components @kind component */
/**
 * MOTION is one section where there were two, and the last rebuild phase 10
 * owed the panel.
 *
 * WHY ONE. "Transitions and Animation are two sections for one idea. Both are
 * 'how this node moves', both have duration + easing, and both are closed by
 * default; an author looking for motion has to know which of two headings owns
 * the case they have." They are three shapes of one thing: an animation runs
 * on its own clock, a transition fires when a bound value changes, and
 * enter/exit cover a repeat gaining or losing a child. Together they were the
 * panel's two least usable sections; apart, neither could be found.
 *
 * THREE SUBSECTIONS, ONE OPEN AT A TIME, using phase 8's `SubsectionGroup`
 * (consumed as shipped, with no stand-in built for it). Each header
 * states its own count, so a closed Motion tells an author which of the three
 * a node is actually using without opening anything.
 *
 * THE ANIMATION CARDS ARE A SECOND LEVEL OF THE SAME CONTROL, and their open
 * index lives here instead of in `AnimationSection` for the reason
 * `SectionAccordion`'s own header gives: "only works if one place owns the
 * set". Switching subsections leaves the card selection alone, so coming back
 * to animations lands where it was left.
 */
import { useState } from 'react';
import { Box } from '@ds/primitives/Box';
import '../HudLayoutEditor.motion.css';
import { SubsectionGroup } from '../SubsectionGroup';
import { EnterExitEditor } from '../EnterExitEditor';
import { AnimationSection } from './AnimationSection';
import { TransitionsSection } from './TransitionsSection';
import type { HudNode } from '@shared/types/hud';

type Block = 'animations' | 'transitions' | 'enterExit';

interface MotionSectionProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  /** `validate-motion-warnings.ts`'s lines for this node, already filtered. */
  warnings: readonly string[];
}

const countLabel = (n: number, one: string, many: string): string =>
  (n === 0 ? 'none' : `${n} ${n === 1 ? one : many}`);

const MotionSection = (props: MotionSectionProps) => {
  const { node, onPatch, scope, insideRepeat, warnings } = props;
  const animations = node.animation ?? [];
  const transition = node.transition;
  const [open, setOpen] = useState<Block | null>('animations');
  const [openCard, setOpenCard] = useState<number | null>(0);

  const enterExit = [transition?.enter ? 'enter' : null, transition?.exit ? 'exit' : null].filter(Boolean);
  const toggle = (block: Block) => () => setOpen((prev) => (prev === block ? null : block));

  return (
    <Box className="hud-inspect__group">
      <SubsectionGroup
        title="animations"
        summary={countLabel(animations.length, 'animation', 'animations')}
        open={open === 'animations'}
        onToggle={toggle('animations')}
      >
        <AnimationSection
          node={node}
          onPatch={onPatch}
          scope={scope}
          insideRepeat={insideRepeat}
          warnings={warnings}
          openIndex={openCard}
          onOpen={setOpenCard}
        />
      </SubsectionGroup>

      <SubsectionGroup
        title="transitions"
        summary={countLabel(transition?.properties.length ?? 0, 'property', 'properties')}
        open={open === 'transitions'}
        onToggle={toggle('transitions')}
      >
        <TransitionsSection node={node} onPatch={onPatch} scope={scope} insideRepeat={insideRepeat} />
      </SubsectionGroup>

      <SubsectionGroup
        title="enter & exit"
        summary={enterExit.length === 0 ? 'none' : enterExit.join(' + ')}
        open={open === 'enterExit'}
        onToggle={toggle('enterExit')}
      >
        <EnterExitEditor node={node} onPatch={onPatch} scope={scope} insideRepeat={insideRepeat} />
      </SubsectionGroup>
    </Box>
  );
};

export { MotionSection };
export type { MotionSectionProps };
