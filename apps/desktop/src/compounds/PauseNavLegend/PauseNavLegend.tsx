/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HudGlyph } from '../../composites/HudGlyph';
import { PauseText } from '../../composites/PauseText';
import {
  GLYPH_GAP, LEGEND_GLYPH, LEGEND_HEIGHT, LEGEND_LEFT_RESERVE, LEGEND_PLATE, LEGEND_TEXT, PAIR_GAP,
} from './PauseNavLegend.constants';
import type { PauseNavLegendProps } from './PauseNavLegend.type';

const PauseNavLegend = (props: PauseNavLegendProps) => {
  const { entries, width, scale, spritesBase } = props;

  const px = (n: number): number => n * scale;

  return (
    <HudBox className="pause-legend" style={{
      width: px(width),
      height: px(LEGEND_HEIGHT),
      boxSizing: 'border-box',
      paddingLeft: px(LEGEND_LEFT_RESERVE),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: px(PAIR_GAP),
      background: LEGEND_PLATE,
    }}>
      {entries.map((entry) => (
        <HudBox
          key={entry.id}
          style={{ display: 'flex', alignItems: 'center', gap: px(GLYPH_GAP) }}
        >
          {entry.glyphs.length > 0
            ? entry.glyphs.map((glyph, index) => (
              <HudGlyph key={index} source={glyph} scale={scale} size={LEGEND_GLYPH} />
            ))
            : <PauseText text={entry.fallback} scale={scale} size={LEGEND_TEXT} spritesBase={spritesBase} />}
          <PauseText text={entry.verb} scale={scale} size={LEGEND_TEXT} dim spritesBase={spritesBase} />
        </HudBox>
      ))}
    </HudBox>
  );
};

export { PauseNavLegend };
