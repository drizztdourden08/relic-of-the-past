/* @layer renderer-components @kind component */
/** Control renderer for the Highlights subsection of the Dialog Box settings. Both boxes draw them. */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { DialogColorControl } from './dialog-color-control';

const renderHighlightControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
  switch (key) {
    case 'hudHighlightPrimary':
      return (
        <DialogColorControl
          label="Highlight Primary"
          description="Item names in randomizer messages"
          value={settings.hudHighlightPrimary}
          original={DEFAULT_SETTINGS.hudHighlightPrimary}
          onChange={(hex) => onChange({ hudHighlightPrimary: hex })}
        />
      );
    case 'hudHighlightSecondary':
      return (
        <DialogColorControl
          label="Highlight Secondary"
          description="Player names in randomizer messages"
          value={settings.hudHighlightSecondary}
          original={DEFAULT_SETTINGS.hudHighlightSecondary}
          onChange={(hex) => onChange({ hudHighlightSecondary: hex })}
        />
      );
    default:
      return null;
  }
};

export { renderHighlightControl };
