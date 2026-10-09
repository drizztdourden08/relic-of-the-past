/* @layer renderer-lib @kind logic */
import { gameIdLabel } from '@rotp/game-data';
import type { SubjectContext } from './build-report-subject.type';

const buildReportSubject = ({ version, gameId }: SubjectContext): string =>
  gameId ? `v${version} · ${gameIdLabel(gameId)}: ` : `v${version}: `;

export { buildReportSubject };
export type { SubjectContext };
