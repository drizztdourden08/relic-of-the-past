/* @layer renderer-hud @kind component */
/**
 * PauseNavLegend is the strip along the bottom saying which button does what.
 *
 * Every glyph here comes from the player's ACTUAL bindings, resolved through
 * the glyph pack chain before it reaches this component. Nothing is a hardcoded
 * letter: a menu that says "press A" to someone who moved confirm onto a
 * shoulder button is worse than no legend at all, and the whole point of making
 * the four menu verbs rebindable is that they can be anywhere.
 *
 * A control with no artwork anywhere falls back to its own text (most often a keyboard
 * key with no cap sprite) instead of leaving a hole where the
 * player is looking for the answer.
 */
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
      // The plate stays the full width of the field; only its CONTENT starts
      // clear of the bottom-left corner, so the pairs centre in what is left
      // instead of centring on the field and running under the wallet.
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
