/* @layer shared-features @kind logic */
import type { ControlSchemeId } from '../../input/scheme';
import type { GameSettings } from '../../types/settings';

const controlSchemeOf = (settings: Pick<GameSettings, 'hudStyle'>): ControlSchemeId =>
  settings.hudStyle === 'modern' ? 'modern' : 'classic';

export { controlSchemeOf };
