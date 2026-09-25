/* @layer renderer-hud @kind component */
/**
 * PauseScreenTabs says which of the three screens is up, and where the other
 * two are.
 *
 * The tabs exist because the content does not fit: three screens need roughly
 * 312 x 264 SNES pixels and the menu area is 310 x 160, so they take turns
 * under a chrome that never moves. A tab strip is the cheapest way to say that
 * out loud. The player can see there are exactly three, and which one they are
 * on, without pressing anything.
 *
 * Switching is a shoulder press, not a click, in normal play; the click path
 * exists so the menu is fully operable with a mouse.
 */
import { HudBox } from '../../primitives/HudBox';
import { PAUSE_FOCUS_COLOR, PauseText } from '../PauseText';
import type { PauseScreenTabsProps } from './PauseScreenTabs.type';

/** Tab wording at half a tile, so three names fit the strip above the panel. */
const TAB_GLYPH = 6;
const TAB_GAP = 8;
const TAB_PAD = 2;
const TAB_UNDERLINE = 1;

const PauseScreenTabs = (props: PauseScreenTabsProps) => {
  const { tabs, active, scale, spritesBase, onSelect } = props;

  const px = (n: number): number => n * scale;

  return (
    <HudBox style={{ display: 'flex', gap: px(TAB_GAP) }}>
      {tabs.map((tab) => (
        <HudBox
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          style={{
            paddingBottom: px(TAB_PAD),
            cursor: 'pointer',
            borderBottom: tab.id === active
              ? `${px(TAB_UNDERLINE)}px solid ${PAUSE_FOCUS_COLOR}`
              : undefined,
          }}
        >
          <PauseText
            text={tab.label}
            scale={scale}
            size={TAB_GLYPH}
            dim={tab.id !== active}
            spritesBase={spritesBase}
          />
        </HudBox>
      ))}
    </HudBox>
  );
};

export { PauseScreenTabs };
