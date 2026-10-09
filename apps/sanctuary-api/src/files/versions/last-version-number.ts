/* @layer root-config @kind logic */
import type { SanctuaryFile } from '@rotp/hub-contracts';

const lastVersionNumber = (file: SanctuaryFile): number => Math.max(0, ...file.versions.map((version) => version.n));

export { lastVersionNumber };
