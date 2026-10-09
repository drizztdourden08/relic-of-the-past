/* @layer root-config @kind logic */
import type { SanctuaryFile } from '../../../../../shared/sanctuary';

const lastVersionNumber = (file: SanctuaryFile): number => Math.max(0, ...file.versions.map((version) => version.n));

export { lastVersionNumber };
