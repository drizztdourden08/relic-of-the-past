/* @layer shared-features @kind logic */
import type { ControlSchemeId } from '../scheme/remap.type';
import type { GameSettings } from '../settings';

const controlSchemeOf = (settings: Pick<GameSettings, 'hudStyle'>): ControlSchemeId =>
  settings.hudStyle === 'modern' ? 'modern' : 'classic';

export { controlSchemeOf };
