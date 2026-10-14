/* @layer renderer-components @kind component */
import { NodeViewWrapper } from '@tiptap/react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ICON_PX } from '../TokenAtom.constants';
import type { PlainAtomProps } from '../TokenAtom.type';

const PlainAtom = (props: PlainAtomProps) => {
  const { attrs, facts, ring } = props;
  const { label, description, icon, value } = facts;
  return (
    <NodeViewWrapper
      as="span"
      className={`token-atom token-atom--${attrs.kind}${ring}`}
      contentEditable={false}
      title={description}
    >
      <Box as="span" className="token-atom__icon" aria-hidden="true">
        <IconifyIcon icon={icon} width={ICON_PX} height={ICON_PX} />
      </Box>
      {attrs.kind === 'ref' ? (
        <Text as="span" className="token-atom__label">{label}</Text>
      ) : null}
      {value === null ? null : (
        <Text as="span" className="token-atom__value">{value}</Text>
      )}
    </NodeViewWrapper>
  );
};

export { PlainAtom };
