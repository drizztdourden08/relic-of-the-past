/* @layer website-site @kind component */
import { Box } from '../../primitives/Box';
import { parseBlocks } from './behavior/parse-blocks';
import { ProseBlockView } from './sub-components/ProseBlockView';
import type { ProseProps } from './Prose.type';
import './Prose.css';

const Prose = ({ source, hideTitle = false }: ProseProps) => {
  const blocks = parseBlocks(source);
  const first = blocks[0];
  const shown = hideTitle && first?.kind === 'heading' && first.level === 1 ? blocks.slice(1) : blocks;

  return (
    <Box className="ds-prose">
      {shown.map((block, index) => (
        <ProseBlockView key={`${block.kind}-${index}`} block={block} />
      ))}
    </Box>
  );
};

export { Prose };
