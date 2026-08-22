/* @layer renderer-components @kind component */
/**
 * One cluster of the toolbar. The heading is not drawn as text — the buttons are
 * grouped and separated by a rule, and each button's tooltip already names it,
 * so a row of headings would double the toolbar's height to repeat what hovering
 * says. The heading survives as the group's accessible name.
 */
import { Box } from '@ds/primitives';
import { ToolbarButton } from './ToolbarButton';
import type { Token } from '@shared/game/language';
import type { GlyphFont, ToolbarGroup } from './editor-ui.type';

type ToolbarGroupRowProps = {
  group: ToolbarGroup;
  disabled: boolean;
  font: GlyphFont;
  onInsert: (token: Token) => void;
};

const ToolbarGroupRow = (props: ToolbarGroupRowProps) => {
  const { group, disabled, font, onInsert } = props;

  return (
    <Box className="editor-toolbar__group" role="group" aria-label={group.heading}>
      {group.items.map((item) => (
        <ToolbarButton
          key={item.id}
          item={item}
          disabled={disabled}
          font={font}
          onInsert={onInsert}
        />
      ))}
    </Box>
  );
};

export { ToolbarGroupRow };
export type { ToolbarGroupRowProps };
