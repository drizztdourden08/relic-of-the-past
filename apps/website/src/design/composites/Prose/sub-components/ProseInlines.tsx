/* @layer website-site @kind component */
import { Box } from '../../../primitives/Box';
import { Link } from '../../../primitives/Link';
import { parseInline } from '../behavior/parse-inline';
import { INLINE_TAGS } from './ProseInlines.constants';

const ProseInlines = ({ text }: { text: string }) => (
  <>
    {parseInline(text).map((node, index) => {
      const key = `${node.kind}-${index}`;
      if (node.kind === 'link') {
        return (
          <Link key={key} href={node.href} external>
            {node.text}
          </Link>
        );
      }
      if (node.kind === 'text') return node.text;
      return (
        <Box key={key} as={INLINE_TAGS[node.kind]}>
          {node.text}
        </Box>
      );
    })}
  </>
);

export { ProseInlines };
