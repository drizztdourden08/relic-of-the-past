/* @layer renderer-lib @kind logic */
/**
 * The prefilled subject of a report: the version, and the screen the game is on when it is
 * running, then a colon for the person to finish the sentence. Editable in the form.
 */
import { gameIdLabel } from '@shared/game/logic/queries/game-id';
import type { GameScreenId } from '@shared/game/logic/queries/game-id';

interface SubjectContext {
  version: string;
  /** The screen the game is on, or null when no game is running. */
  gameId: GameScreenId | null;
}

const buildReportSubject = ({ version, gameId }: SubjectContext): string =>
  gameId ? `v${version} · ${gameIdLabel(gameId)}: ` : `v${version}: `;

export { buildReportSubject };
export type { SubjectContext };
