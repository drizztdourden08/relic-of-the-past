/* @layer renderer-components @kind component */
/**
 * WHICH ENGINE ARRANGES THIS CONTAINER. Two icon buttons, and nothing else.
 *
 * IT WAS A FULL-WIDTH `SegmentedControl` UNDER AN "ENGINE" LABEL (§51). Two
 * words and a 26 px row cost a labelled `Field` about 40 px in a section
 * whose whole problem was height, and the question it asks has exactly two
 * answers, both of which are pictures. An icon that IS the label does not need
 * a label above it, which is where the height goes.
 *
 * ONE DEFINITION, TWO MOUNTS. A grid puts it in `GridEditor`'s persistent
 * toolbar group and a flex container puts it at the head of its own bar; if the
 * pair lived in either of those files the other would grow a second copy that
 * drifts. It is deliberately dumb. `onChange` is the caller's engine swap,
 * which RESHAPES the node (`LayoutSection`), and this control never knows that.
 *
 * THE ICONS ARE THE ARRANGEMENT, NOT THE WORD. `align-horizontal-distribute-
 * center` draws three bars spread along one line, which is what a flex
 * container does; `grid-3x3` draws a lattice, which is what a grid does, and is
 * the same icon the insert bar's own Grid row uses (§50). Naming them after the
 * words `flex` and `grid` would have left two abstract glyphs nobody can tell
 * apart at 16 px.
 */
import flexIcon from '@iconify-icons/lucide/align-horizontal-distribute-center';
import gridIcon from '@iconify-icons/lucide/grid-3x3';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { IconButton } from '@ds/primitives/IconButton';
import './HudLayoutEditor.layout.css';
import type { IconifyIcon as IconifyIconData } from '@iconify/types';

type LayoutEngine = 'flex' | 'grid';

const ENGINES: readonly { value: LayoutEngine; icon: IconifyIconData; label: string }[] = [
  { value: 'flex', icon: flexIcon, label: 'flex. Children flow in one line' },
  { value: 'grid', icon: gridIcon, label: 'grid. Children sit in cells' },
];

interface EngineToggleProps {
  value: LayoutEngine;
  onChange: (next: string) => void;
}

const EngineToggle = (props: EngineToggleProps) => {
  const { value, onChange } = props;
  return (
    <Box className="hud-icon-choice" role="group" aria-label="engine">
      {ENGINES.map((engine) => (
        <IconButton
          key={engine.value}
          variant="ghost"
          size="sm"
          title={engine.label}
          active={value === engine.value}
          label={engine.label}
          data-engine={engine.value}
          onClick={() => onChange(engine.value)}
        >
          <IconifyIcon icon={engine.icon} width={16} height={16} aria-hidden />
        </IconButton>
      ))}
    </Box>
  );
};

export { ENGINES, EngineToggle };
export type { EngineToggleProps, LayoutEngine };
