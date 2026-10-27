/* @layer website-site @kind component */
import { Box } from '../../../primitives/Box';
import { List, ListItem } from '../../../primitives/List';
import { P } from '../../../primitives/Text';
import { HEADING_TAGS } from '../Prose.constants';
import type { ProseBlock } from '../Prose.type';
import { ProseInlines } from './ProseInlines';

const ProseBlockView = ({ block }: { block: ProseBlock }) => {
  if (block.kind === 'heading') {
    const tag = HEADING_TAGS[Math.min(block.level, 6) - 1] ?? 'h6';
    return (
      <Box as={tag} className={`ds-prose__heading ds-prose__heading--${block.level}`}>
        <ProseInlines text={block.text} />
      </Box>
    );
  }
  if (block.kind === 'list') {
    return (
      <List>
        {block.items.map((item) => (
          <ListItem key={item}>
            <ProseInlines text={item} />
          </ListItem>
        ))}
      </List>
    );
  }
  return (
    <P className="ds-prose__paragraph">
      <ProseInlines text={block.text} />
    </P>
  );
};

export { ProseBlockView };
