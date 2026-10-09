/* @layer renderer-lib @kind logic */
import type { SaveKind } from '@shared/storage/save-paths';
import * as resume from '@shared/storage/msu-resume';
import { platformFiles } from '../platform-files';

const readMsuResume = (profile: string, kind: SaveKind, id: string | number) =>
  resume.readMsuResume(platformFiles(), profile, kind, id);

export { readMsuResume };
