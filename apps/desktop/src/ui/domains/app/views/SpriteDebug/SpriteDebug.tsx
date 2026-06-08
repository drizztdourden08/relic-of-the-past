/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import type { SpriteDebugProps, ReviewMode } from './SpriteDebug.type';
import { SpriteReviewPanel } from './sub-components/SpriteReviewPanel';
import { ItemReviewPanel } from './sub-components/ItemReviewPanel';
import { S } from './SpriteDebug.constants';

const SpriteDebug = (props: SpriteDebugProps) => {
  const { onClose, romFile } = props;
  const [mode, setMode] = useState<ReviewMode>('sprites');
  const baseUrl = romFile ? window.api.getSpritesBaseUrl(romFile) : '';

  return (
    <Box style={S.overlay}>
      <Box style={S.topBar}>
        <Box style={S.modeToggle}>
          <Box
            as="button"
            onClick={() => setMode('sprites')}
            style={{ ...S.modeBtn, ...(mode === 'sprites' ? S.modeBtnActive : {}) }}
          >
            Sprite Review
          </Box>
          <Box
            as="button"
            onClick={() => setMode('items')}
            style={{ ...S.modeBtn, ...(mode === 'items' ? S.modeBtnActive : {}) }}
          >
            Item Association
          </Box>
        </Box>
        <Text style={S.modeHint}>
          {mode === 'sprites'
            ? 'Does each extracted image look correct?'
            : 'Is each item mapped to the right sprite?'}
        </Text>
        <Box as="button" onClick={onClose} style={S.closeBtn}>✕</Box>
      </Box>

      {mode === 'sprites' ? <SpriteReviewPanel baseUrl={baseUrl} /> : <ItemReviewPanel baseUrl={baseUrl} />}
    </Box>
  );
};

export { SpriteDebug };
