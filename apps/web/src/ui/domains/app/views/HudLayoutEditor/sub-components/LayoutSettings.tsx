/* @layer renderer-components @kind component */
/**
 * SECTION ONE (LAYOUT): THE TYPE, AND WHAT IS TRUE OF EVERY CONTAINER (§58).
 *
 * THE RULE THIS FILE EXISTS TO KEEP, in the maintainer's words:
 *
 * > "THE FUCKING OPTIONS GO BY CONCERNS. NOTHING IN A FUCKING SECTION SHOULD
 * > CHANGE WHEN CLICKING ANY FUCKING OTHER OPTION IN THAT SAME FUCKING SECTION!"
 *
 * §56 broke it here and wrote the breakage down as if it were a fact: one gap
 * cell for a flex container and two for a grid, and an overlay for a grid only.
 * So pressing TYPE, which is an option in this section, grew a second gap field and
 * made a whole piece appear. §57 removed the model's half of that excuse (both
 * engines store `gap: { x, y }`; `guide` is any container's; the overlay draws
 * a flex container's slots), and this is the panel's half:
 *
 * - **TYPE** is `flex | grid`. Pressing it lights the other button. That is the
 *   entire visible change inside this section; everything else it does happens
 *   in LATER sections, which the rule allows and which is why Flow is its own
 *   section instead of a line in the one that holds the alignment tiles.
 * - **GAP** is `↔` and `↕`, two `ValueField`s, under BOTH engines. `x` is always
 *   horizontal and `y` always vertical whichever way the children flow, so the
 *   two cells mean the same thing in both and neither appears or disappears.
 * - **OVERLAY** is the toggle and the guide swatch, under BOTH engines. A grid
 *   draws its cell boundaries and a flex container its children's slots; the
 *   colour is the container's own `guide.color` either way.
 *
 * THE LABELS ARE BESIDE THE CONTROL, NOT ABOVE IT (§56, kept): the row is 26px
 * tall whatever happens, so a word costs ~30px of WIDTH where a label line would
 * cost ~14px of HEIGHT three times over.
 *
 * THE TWO GAP CELLS SHARE A HOST BOX, and it is not decoration: a formula being
 * typed in one of them floats over the other instead of shoving it onto a new
 * row (§58's promotion), and `.hud-layout-set__gaps` is the box it spans.
 *
 * IT IS TITLED `CONTAINER`, NOT `LAYOUT`, AND THAT IS WHAT THE PHOTOGRAPH SAID.
 * The accordion this sits inside is already called LAYOUT, so a sub-section of
 * the same name read as a stutter (`LAYOUT / LAYOUT`), which is §55's "saying
 * it twice" complaint in a new place. `CONTAINER` is what the section actually
 * holds: the three questions EVERY container answers, whichever engine it picks.
 */
import { useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { ColorSwatch } from '@ds/primitives/ColorSwatch';
import { IconButton } from '@ds/primitives/IconButton';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Text } from '@ds/primitives/Text';
import { ColorPickerPopover } from '@ds/composites/ColorPickerPopover';
import { EngineToggle } from './EngineToggle';
import { SubSection } from './SubSection';
import { ValueField } from './ValueField';
import { TOOLBAR_ICONS } from '../behavior/toolbar-menus';
import './HudLayoutEditor.layout.css';
import type { LayoutSettingsProps } from './LayoutSettings.type';
import type { ReactNode } from 'react';

const DEFAULT_GUIDE = '#c064c0';
const OVERLAY_LABEL =
  'Show the container overlay, which draws a grid\'s own cell lines, or a flex container\'s child slots, over the preview in the guide colour. Editor only.';

/** A labelled piece: a word, then the control, on one line. */
const Piece = (props: { label: string; grow?: boolean; children: ReactNode }) => (
  <Box className={`hud-layout-set__piece${props.grow ? ' hud-layout-set__piece--grow' : ''}`}>
    <Text className="hud-layout-set__label">{props.label}</Text>
    {props.children}
  </Box>
);

const LayoutSettings = (props: LayoutSettingsProps) => {
  const { engine, onSetEngine, overlay, gap, onGap, scope, insideRepeat } = props;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <SubSection title="Container">
      <Box className="hud-layout-set">
        <Piece label="Type">
          <EngineToggle value={engine} onChange={onSetEngine} />
        </Piece>

        <Piece label="Overlay">
          <Box ref={anchorRef} className="hud-layout-set__overlay">
            <ColorSwatch
              size="sm"
              color={overlay.guide}
              aria-label="Open the guide colour picker"
              title="Guide colour for this container's own overlay, in the preview and in this panel"
              onClick={() => setOpen(true)}
            />
            <IconButton
              variant="ghost"
              size="sm"
              active={overlay.overlayOn}
              label={OVERLAY_LABEL}
              title={OVERLAY_LABEL}
              data-action="grid-overlay"
              onClick={overlay.onToggleOverlay}
            >
              <IconifyIcon icon={TOOLBAR_ICONS.gridView} width={16} height={16} aria-hidden />
            </IconButton>
            <ColorPickerPopover
              open={open}
              anchorRef={anchorRef}
              value={overlay.guide}
              onChange={overlay.onGuide}
              onClose={() => setOpen(false)}
            />
          </Box>
        </Piece>

        <Piece label="Gap" grow>
          <Box className="hud-layout-set__gaps">
            {gap.map((cell) => (
              <Box key={cell.axis} className="hud-layout-set__gap">
                <Text className="hud-layout-set__cap" aria-hidden>{cell.cap}</Text>
                <ValueField
                  aria-label={cell.label}
                  value={cell.value}
                  onChange={(next) => onGap(cell.axis, next)}
                  scope={scope}
                  insideRepeat={insideRepeat}
                  min={0}
                />
              </Box>
            ))}
          </Box>
        </Piece>
      </Box>
    </SubSection>
  );
};

export { DEFAULT_GUIDE, LayoutSettings, OVERLAY_LABEL };
