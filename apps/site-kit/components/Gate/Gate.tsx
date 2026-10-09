/* @layer site-kit @kind component */
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { GateProps } from './Gate.type';
import './Gate.css';

const Gate = (props: GateProps) => {
  const { title, lead, children, footnote } = props;
  return (
    <Stack as="section" gap="md" align="stretch" className="gate">
      {title && <Text as="h1" variant="title" className="gate__title">{title}</Text>}
      {lead && <Text as="p" className="gate__lead">{lead}</Text>}
      {children}
      {footnote && <Text as="p" variant="caption" className="gate__foot">{footnote}</Text>}
    </Stack>
  );
};

export { Gate };
export type { GateProps } from './Gate.type';
