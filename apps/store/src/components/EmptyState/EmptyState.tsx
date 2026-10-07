/* @layer store-site @kind component */
/**
 * What an empty part of a page shows: the message large and gold in the middle of the
 * space the content would fill, over faint diagonal stripes that fade out towards the
 * edges. `banner` takes the featured banner's shape, `row` the height of a row of cards.
 */
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import './EmptyState.css';

type EmptyStateProps = {
  message: string;
  shape: 'banner' | 'row';
  /** Names the part for screen readers when it has no heading of its own. */
  label?: string;
};

const EmptyState = (props: EmptyStateProps) => {
  const { message, shape, label } = props;
  return (
    <Flex align="center" justify="center" className={`empty-state empty-state--${shape}`} aria-label={label}>
      <Text as="p" className="empty-state__message">{message}</Text>
    </Flex>
  );
};

export { EmptyState };
export type { EmptyStateProps };
