/* @layer site-kit @kind component */
import { Flex } from '@ds/primitives/Flex';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import type { TagListProps } from './TagList.type';
import './TagList.css';

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
export type { TagListProps } from './TagList.type';
