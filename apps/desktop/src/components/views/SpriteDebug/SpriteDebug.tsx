import { useState } from 'react';
import type { SpriteDebugProps, ReviewMode } from './types';
import { SpriteReviewPanel } from './sub-components/SpriteReviewPanel';
import { ItemReviewPanel } from './sub-components/ItemReviewPanel';
import { S } from './styles';

const SpriteDebug = (props: SpriteDebugProps) => {
  const { onClose } = props;
  const [mode, setMode] = useState<ReviewMode>('sprites');

  return (
    <div style={S.overlay}>
      <div style={S.topBar}>
        <div style={S.modeToggle}>
          <button
            onClick={() => setMode('sprites')}
            style={{ ...S.modeBtn, ...(mode === 'sprites' ? S.modeBtnActive : {}) }}
          >
            Sprite Review
          </button>
          <button
            onClick={() => setMode('items')}
            style={{ ...S.modeBtn, ...(mode === 'items' ? S.modeBtnActive : {}) }}
          >
            Item Association
          </button>
        </div>
        <span style={S.modeHint}>
          {mode === 'sprites'
            ? 'Does each extracted image look correct?'
            : 'Is each item mapped to the right sprite?'}
        </span>
        <button onClick={onClose} style={S.closeBtn}>✕</button>
      </div>

      {mode === 'sprites' ? <SpriteReviewPanel /> : <ItemReviewPanel />}
    </div>
  );
};

export { SpriteDebug };
