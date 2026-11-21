/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { SubsectionGroup } from './SubsectionGroup';
import { EnterExitEditor } from './EnterExitEditor';
import { AnimationSection } from './AnimationSection';
import { TransitionsSection } from './TransitionsSection';
import type { MotionBlock, MotionSectionProps } from './MotionSection.type';
import { useT } from '@drizztdourden08/brock-react';

const MotionSection = (props: MotionSectionProps) => {
  const t = useT();
  const { node, onPatch, scope, insideRepeat, warnings } = props;
  const animations = node.animation ?? [];
  const transition = node.transition;
  const [open, setOpen] = useState<MotionBlock | null>('animations');
  const [openCard, setOpenCard] = useState<number | null>(0);

  const enterExit = [transition?.enter ? t('hud-editor:motion-section.enter') : null, transition?.exit ? t('hud-editor:motion-section.exit') : null].filter(Boolean);
  const toggle = (block: MotionBlock) => () => setOpen((prev) => (prev === block ? null : block));

  return (
    <Box className="hud-inspect__group">
      <SubsectionGroup
        title={t('hud-editor:motion-section.title.animations')}
        summary={t('hud-editor:motion-section.count.animations', { count: animations.length })}
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
        title={t('hud-editor:motion-section.title.transitions')}
        summary={t('hud-editor:motion-section.count.properties', { count: transition?.properties.length ?? 0 })}
        open={open === 'transitions'}
        onToggle={toggle('transitions')}
      >
        <TransitionsSection node={node} onPatch={onPatch} scope={scope} insideRepeat={insideRepeat} />
      </SubsectionGroup>

      <SubsectionGroup
        title={t('hud-editor:motion-section.title.enter-exit')}
        summary={enterExit.length === 0 ? t('hud-editor:motion-section.none') : enterExit.join(' + ')}
        open={open === 'enterExit'}
        onToggle={toggle('enterExit')}
      >
        <EnterExitEditor node={node} onPatch={onPatch} scope={scope} insideRepeat={insideRepeat} />
      </SubsectionGroup>
    </Box>
  );
};

export { MotionSection };
