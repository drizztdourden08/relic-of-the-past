/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { PAUSE_FOCUS_COLOR, PauseText } from '../PauseText';
import { TAB_GAP, TAB_GLYPH, TAB_PAD, TAB_UNDERLINE } from './PauseScreenTabs.constants';
import type { PauseScreenTabsProps } from './PauseScreenTabs.type';

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
