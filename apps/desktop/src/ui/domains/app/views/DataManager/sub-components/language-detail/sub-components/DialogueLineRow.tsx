/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
import { tokenizeDialogue } from '../behavior/tokenizeDialogue';
import type { DialogueLine } from '@shared/types/language';

const DialogueLineRow = (props: { line: DialogueLine }) => {
  const { line } = props;
  const tokens = useMemo(() => tokenizeDialogue(line.content), [line.content]);

  return (
    <Box className="dialogue-line">
      <Text className="dialogue-line__id">{String(line.id).padStart(3, '0')}</Text>
      <Box className="dialogue-line__content">
        {tokens.map((tok, i) => (
          <Text
            key={i}
            as="span"
            className={tok.type === 'code' ? 'dialogue-line__code' : 'dialogue-line__text'}
          >
            {tok.value}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

export { DialogueLineRow };
