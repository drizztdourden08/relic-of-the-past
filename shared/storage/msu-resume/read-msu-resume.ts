/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { MsuResumeState } from '@shared/types/msu-manifest';
import type { SaveKind } from '../save-paths';
import { isResumeState } from './is-resume-state';
import { resumePath } from './resume-path';

const readMsuResume = async (files: FileStore, profile: string, kind: SaveKind,
  id: string | number): Promise<MsuResumeState | null> => {
  const text = await files.readText(resumePath(profile, kind, id));
  if (text == null) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return isResumeState(parsed) ? parsed : null;
  } catch { return null; }
};

export { readMsuResume };
