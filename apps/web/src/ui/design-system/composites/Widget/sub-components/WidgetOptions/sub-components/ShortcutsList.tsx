/* @layer renderer-components @kind component */
/** The keys the layout answers to, listed in the options panel so nothing has to be remembered. */
import { Box } from '../../../../../primitives/Box';
import { Text } from '../../../../../primitives/Text';

const SHORTCUTS: { keys: string; does: string }[] = [
  { keys: 'Drag title', does: 'Move to a dock edge, a pane, a tab or over the game' },
  { keys: 'Alt', does: 'Peek: widgets fold away while held' },
  { keys: 'Shift + drop', does: 'Swap with the pane under the pointer' },
  { keys: 'Ctrl + drop', does: 'Land as an overlay, the game keeps its room' },
  { keys: 'Esc', does: 'Cancel the drag' },
  { keys: 'Drag past the edge', does: 'Pop out into its own window' },
  { keys: 'Drag the gap', does: 'Resize neighbours; double-click evens them' },
];

const ShortcutsList = () => (
  <Box className="widget-shortcuts">
    {SHORTCUTS.map(({ keys, does }) => (
      <Box key={keys} className="widget-shortcuts__row">
        <Text as="kbd" className="widget-shortcuts__kbd">{keys}</Text>
        <Text className="widget-shortcuts__does">{does}</Text>
      </Box>
    ))}
  </Box>
);

export { ShortcutsList };
