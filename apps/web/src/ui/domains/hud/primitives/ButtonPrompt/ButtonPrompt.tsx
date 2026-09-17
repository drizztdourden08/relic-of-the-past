/* @layer renderer-hud @kind component */
/**
 * One button prompt: an optional "Hold", the pictures of the buttons to press, and a label. A button
 * with no picture (a key the icon set does not cover) shows its name in a small keycap instead.
 */
import type { CSSProperties } from 'react';
import { HudBox } from '../HudBox';
import { HudImage } from '../HudImage';

interface PromptGlyph {
  src: string | null;
  label: string;
}

interface ButtonPromptProps {
  glyphs: PromptGlyph[];
  label: string;
  hold?: boolean;
  /** Prompt height in CSS pixels. */
  height: number;
  ink: string;
  stroke: string;
}

const textStyle = (height: number, ink: string, stroke: string): CSSProperties => {
  const edge = Math.max(1, Math.round(height / 12));
  return {
    fontFamily: 'var(--font-game)',
    fontSize: height,
    lineHeight: `${height}px`,
    color: ink,
    WebkitTextStroke: `${edge}px ${stroke}`,
    paintOrder: 'stroke fill',
    textShadow: `${edge}px 0 0 ${stroke}, -${edge}px 0 0 ${stroke}, 0 ${edge}px 0 ${stroke}, 0 -${edge}px 0 ${stroke}`,
    whiteSpace: 'pre',
  };
};

const keycapStyle = (height: number, ink: string, stroke: string): CSSProperties => ({
  ...textStyle(Math.round(height * 0.8), ink, stroke),
  minWidth: height,
  height,
  padding: `0 ${Math.round(height / 5)}px`,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `${Math.max(1, Math.round(height / 10))}px solid ${ink}`,
  borderRadius: Math.round(height / 5),
});

const ButtonPrompt = (props: ButtonPromptProps) => {
  const { glyphs, label, hold, height, ink, stroke } = props;
  const text = textStyle(height, ink, stroke);
  const gap = Math.round(height / 5);
  return (
    <HudBox style={{ display: 'flex', alignItems: 'center', gap }}>
      {hold && <HudBox as="span" style={text}>Hold</HudBox>}
      {glyphs.map((glyph, index) => (glyph.src
        ? <HudImage key={index} src={glyph.src} alt={glyph.label} style={{ display: 'block', height, width: 'auto' }} />
        : <HudBox key={index} as="span" style={keycapStyle(height, ink, stroke)}>{glyph.label}</HudBox>
      ))}
      <HudBox as="span" style={text}>{label}</HudBox>
    </HudBox>
  );
};

export { ButtonPrompt };
export type { ButtonPromptProps, PromptGlyph };
