/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { SubsectionGroup } from './SubsectionGroup';
import { EnterExitEditor } from './EnterExitEditor';
import { AnimationSection } from './AnimationSection';
import { TransitionsSection } from './TransitionsSection';
import type { MotionBlock, MotionSectionProps } from './MotionSection.type';

const countLabel = (n: number, one: string, many: string): string =>
  (n === 0 ? 'none' : `${n} ${n === 1 ? one : many}`);

const MotionSection = (props: MotionSectionProps) => {
  const { node, onPatch, scope, insideRepeat, warnings } = props;
  const animations = node.animation ?? [];
  const transition = node.transition;
  const [open, setOpen] = useState<MotionBlock | null>('animations');
  const [openCard, setOpenCard] = useState<number | null>(0);

  const enterExit = [transition?.enter ? 'enter' : null, transition?.exit ? 'exit' : null].filter(Boolean);
  const toggle = (block: MotionBlock) => () => setOpen((prev) => (prev === block ? null : block));

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
export type { MotionSectionProps } from './MotionSection.type';
