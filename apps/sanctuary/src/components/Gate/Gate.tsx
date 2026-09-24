/* @layer sanctuary-site @kind component */
/**
 * The centred column the public pages use: a title, one short paragraph, a stack of
 * full-width buttons and a footnote. Sign in, Pending and Device are all this shape.
 */
import type { ReactNode } from 'react';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import './Gate.css';

type GateProps = {
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  footnote?: ReactNode;
};

const Gate = (props: GateProps) => {
  const { title, lead, children, footnote } = props;
  return (
    <Stack as="section" gap="md" align="stretch" className="gate">
      <Text as="h1" variant="title" className="gate__title">{title}</Text>
      {lead && <Text as="p" className="gate__lead">{lead}</Text>}
      {children}
      {footnote && <Text as="p" variant="caption" className="gate__foot">{footnote}</Text>}
    </Stack>
  );
};

export { Gate };
export type { GateProps };
