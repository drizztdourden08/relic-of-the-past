/* @layer root-config @kind logic */
import type { FileVersion, SanctuaryFile } from '@rotp/hub-contracts';

const replaceVersion = (file: SanctuaryFile, next: FileVersion): FileVersion[] =>
  file.versions.map((version) => (version.n === next.n ? next : version));

export { replaceVersion };
