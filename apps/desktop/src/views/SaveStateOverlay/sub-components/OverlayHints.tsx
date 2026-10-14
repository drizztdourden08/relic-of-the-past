/* @layer renderer-components @kind component */
import { Box, Text, ProgressRing } from '@drizztdourden08/tessera/primitives';
import { InputGlyph } from '../../../compounds/InputGlyph';
import { HINT_LABELS } from '../SaveStateOverlay.constants';
import type { OverlayHintsProps } from '../SaveStateOverlay.type';

const OverlayHints = ({ hints, holdProgress }: OverlayHintsProps) => (
  <Box className="save-overlay__hints">
    {hints.map((hint) => (
      <Box key={hint.action} className={`save-overlay__hint save-overlay__hint--${hint.action}`}>
        <Box className="save-overlay__hint-icon-wrap">
          <InputGlyph
            binding={hint.binding}
            icon={hint.icon}
            showLabel={false}
            size="sm"
            fallbackVariant="plain"
            fallbackClassName="save-overlay__hint-key-text"
          />
          {(hint.action === 'hold-save' || hint.action === 'holding-save') && (
            <ProgressRing
              className="save-overlay__hint-ring"
              progress={hint.action === 'holding-save' ? (holdProgress ?? 0) : undefined}
            />
          )}
        </Box>
        <Text className="save-overlay__hint-label">{HINT_LABELS[hint.action]}</Text>
      </Box>
    ))}
  </Box>
);

export { OverlayHints };
