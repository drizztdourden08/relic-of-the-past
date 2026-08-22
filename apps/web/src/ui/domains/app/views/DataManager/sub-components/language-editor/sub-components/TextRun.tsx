/* @layer renderer-components @kind component */
/**
 * One run of plain text, with every character advancing by its REAL width.
 *
 * The face is monospaced and the game's is not, so printing the run as a single
 * string overstates every narrow letter and a line that fits can look as though
 * it overruns. Each character therefore gets its own cell, exactly as wide as
 * the set's own table says, which makes the length on screen the length in the
 * box — and the row's edge rule finally means what it says.
 *
 * Ink is not clipped to that cell. The engine emits only as many pixel columns
 * as the width allows, but a glyph's ink already sits at the left of its cell,
 * so letting it paint its full width and merely advancing less is both closer to
 * the result and safer than cropping a letter in half.
 */
import { useMemo } from 'react';
import { Text } from '@ds/primitives';
import { textCells } from './text-cells';
import type { GlyphMetrics } from '@shared/game/language';
import './TextRun.css';

type TextRunProps = {
  text: string;
  /** Null while the set's font is unread; the run then falls back to the face. */
  metrics: GlyphMetrics | null;
};

/** Advance as a CSS length in game pixels, scaled by the surrounding cell. */
const advanceOf = (widthPx: number | null): string | undefined => (
  widthPx === null ? undefined : `calc(${widthPx} * var(--game-scale) * 1px)`
);

const TextRun = (props: TextRunProps) => {
  const { text, metrics } = props;
  const cells = useMemo(() => textCells(text, metrics), [text, metrics]);

  if (!metrics) return <Text as="span" className="text-run">{text}</Text>;

  return (
    <Text as="span" className="text-run">
      {cells.map((cell, index) => (
        <Text
          key={index}
          as="span"
          className={cell.widthPx === null ? 'text-run__cell text-run__cell--unknown' : 'text-run__cell'}
          style={{ width: advanceOf(cell.widthPx) }}
        >
          {cell.ch}
        </Text>
      ))}
    </Text>
  );
};

export { TextRun };
export type { TextRunProps };
