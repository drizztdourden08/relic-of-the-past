/* @layer renderer-components @kind component */
/**
 * One line of a capacity family: a short label in a fixed track, the
 * controls beside it, and an optional note under them. Every line of the
 * row (range, items, jumps, bonus, ladder) sits on this same grid, so the
 * labels line up down the family and the eye reads the family as a list of
 * named facts instead of a stack of captioned controls.
 */
import { Box, Text } from '@ds/primitives';
import type { ReactNode } from 'react';

interface RowLineProps {
  label: string;
  children: ReactNode;
  /** A standing rule or clarifier printed under the controls, in the quiet voice. */
  note?: string;
  className?: string;
}

const RowLine = (props: RowLineProps) => {
  const { label, children, note, className = '' } = props;
  return (
    <Box className={`capacity-row__line${className ? ` ${className}` : ''}`}>
      <Text className="capacity-row__line-label">{label}</Text>
      <Box className="capacity-row__line-body">
        <Box className="capacity-row__line-controls">{children}</Box>
        {note !== undefined && <Text className="capacity-row__note">{note}</Text>}
      </Box>
    </Box>
  );
};

export { RowLine };
export type { RowLineProps };
