/* @layer root-config @kind logic */
import type { FileVersion, SanctuaryFile } from '@rotp/hub-contracts';
import { notFound } from '../../../../hub-core/http/http-error';
import { versionOf } from './version-of';

const loadVersion = (file: SanctuaryFile, routeParam: string): FileVersion => {
  const n = Number(routeParam);
  const version = Number.isInteger(n) ? versionOf(file, n) : null;
  if (!version) throw notFound('No such version.');
  return version;
};

export { loadVersion };
