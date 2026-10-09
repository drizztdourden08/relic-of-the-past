/* @layer site-kit @kind component */
import { Flex, Tag, Text } from '@drizztdourden08/tessera/primitives';
import type { TagListProps } from './TagList.type';

const TagList = (props: TagListProps) => {
  const { tags, className } = props;
  if (tags.length === 0) return <Text as="span" variant="caption">-</Text>;
  return (
    <Flex gap="xs" wrap className={className}>
      {tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
    </Flex>
  );
};

export { TagList };
export type { TagListProps } from './TagList.type';
