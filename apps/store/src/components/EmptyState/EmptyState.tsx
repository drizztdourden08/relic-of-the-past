/* @layer store-site @kind component */
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import type { EmptyStateProps } from './EmptyState.type';
import './EmptyState.css';

const EmptyState = (props: EmptyStateProps) => {
  const { message, shape, label } = props;
  return (
    <Flex align="center" justify="center" className={`empty-state empty-state--${shape}`} aria-label={label}>
      <Text as="p" className="empty-state__message">{message}</Text>
    </Flex>
  );
};

export { EmptyState };
export type { EmptyStateProps } from './EmptyState.type';
