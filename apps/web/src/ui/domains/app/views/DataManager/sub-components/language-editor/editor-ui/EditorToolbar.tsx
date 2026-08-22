/* @layer renderer-components @kind component */
/**
 * The row of icon buttons along the top of the editor card: everything a
 * translator can put into a line that is not a typed letter, clustered by what
 * the cluster DOES — dynamic values, pacing, layout, the alphabet's own picture
 * characters.
 *
 * Nothing is decided here. The clusters arrive built from the control-code
 * catalog and the language's own alphabet, and every insert is reported upward
 * so the editor can place it at the caret.
 *
 * MOUSEDOWN IS SWALLOWED, deliberately. A button that takes focus would blur the
 * text area, which both loses the caret the insert is aimed at and closes the
 * legend under the editor. Suppressing the default on mousedown leaves focus in
 * the text the whole time; the click still fires.
 */
import { useCallback } from 'react';
import { Box } from '@ds/primitives';
import { ToolbarGroupRow } from './ToolbarGroupRow';
import type { MouseEvent } from 'react';
import type { Token } from '@shared/game/language';
import type { GlyphFont, ToolbarGroup } from './editor-ui.type';
import './EditorToolbar.css';

type EditorToolbarProps = {
  groups: ToolbarGroup[];
  disabled?: boolean;
  /** The pack's font, for the picture-character buttons. */
  font: GlyphFont;
  onInsert: (token: Token) => void;
};

const EditorToolbar = (props: EditorToolbarProps) => {
  const { groups, disabled = false, font, onInsert } = props;

  const handleMouseDown = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  return (
    <Box
      className="editor-toolbar"
      role="toolbar"
      aria-label="Insert into this line"
      onMouseDown={handleMouseDown}
    >
      {groups.map((group) => (
        <ToolbarGroupRow
          key={group.id}
          group={group}
          disabled={disabled}
          font={font}
          onInsert={onInsert}
        />
      ))}
    </Box>
  );
};

export { EditorToolbar };
export type { EditorToolbarProps };
