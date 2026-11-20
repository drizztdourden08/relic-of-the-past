/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { optionText } from '@rotp/randomizer';
import type { EntityKind } from '@rotp/game-data';

const noPathMessage = (kind: EntityKind, action: 'create' | 'delete' | 'write'): string =>
  optionText(msg(`views-data-inspector:err.noPath.${action}`, { kind }));

export { noPathMessage };
