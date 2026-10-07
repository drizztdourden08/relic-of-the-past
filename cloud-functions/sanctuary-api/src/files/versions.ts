/* @layer root-config @kind logic */
/** Reading and rewriting a file's version list. Versions are never renumbered;
 *  the top-level name, bytes, sha256 and content type mirror the current one. */
import type { FileVersion, SanctuaryFile } from '../../../../shared/sanctuary';
import { forbidden, notFound } from '../http/http-error';
import type { Member } from '../auth/require-access';

type VersionMirror = Pick<SanctuaryFile, 'name' | 'bytes' | 'sha256' | 'contentType'>;

const versionOf = (file: SanctuaryFile, n: number): FileVersion | null =>
  file.versions.find((version) => version.n === n) ?? null;

const currentVersionOf = (file: SanctuaryFile): FileVersion =>
  versionOf(file, file.currentVersion) ?? file.versions[file.versions.length - 1];

const lastVersionNumber = (file: SanctuaryFile): number => Math.max(0, ...file.versions.map((version) => version.n));

/** The `:n` route parameter as a version of this file, or a 404. */
const loadVersion = (file: SanctuaryFile, raw: string): FileVersion => {
  const n = Number(raw);
  const version = Number.isInteger(n) ? versionOf(file, n) : null;
  if (!version) throw notFound('No such version.');
  return version;
};

const mirrorOf = ({ name, bytes, sha256, contentType }: FileVersion): VersionMirror => ({ name, bytes, sha256, contentType });

const replaceVersion = (file: SanctuaryFile, next: FileVersion): FileVersion[] =>
  file.versions.map((version) => (version.n === next.n ? next : version));

const assertUploader = (version: FileVersion, { caller }: Member): void => {
  if (version.by.userId !== caller.userId) throw forbidden('Only the person uploading this version can do that.');
};

export { versionOf, currentVersionOf, lastVersionNumber, loadVersion, mirrorOf, replaceVersion, assertUploader };
export type { VersionMirror };
