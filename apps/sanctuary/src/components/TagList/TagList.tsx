/* @layer sanctuary-site @kind component */
/** A file's tags as a row of small pills; empty renders a dash so the row keeps its height. */
import { Flex } from '@ds/primitives/Flex';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import './TagList.css';

type TagListProps = {
  tags: readonly string[];
  className?: string;
};

const TagList = (props: TagListProps) => {
  const { tags, className = '' } = props;
  if (tags.length === 0) return <Text as="span" variant="caption">-</Text>;
  return (
    <Flex as="ul" gap="xs" wrap className={`tag-list${className ? ` ${className}` : ''}`}>
      {tags.map((tag) => (
        <Box as="li" key={tag} className="tag-list__tag">{tag}</Box>
      ))}
    </Flex>
  );
};

export { TagList };
export type { TagListProps };
